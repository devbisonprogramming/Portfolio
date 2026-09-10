import * as THREE from 'three';
import { projects } from '../data/projects.js';
import { openProjectModal } from '../components/project-modal.js';
import { createScene } from './scene.js';
import { createArc } from './arcs.js';
import { createNode } from './nodes.js';
import { createAmbience } from './glow.js';
import { createHub } from './hub.js';
import { createPointer } from './interaction.js';
import { createKeyboardLayer } from './keyboard.js';
import { disposeTextures } from './textures.js';
import { prefersReducedMotion } from '../lib/motion.js';

/**
 * The desktop dial. This module is loaded on demand by wheel/index.js, which
 * is what keeps Three.js out of the bundle entirely for visitors below the
 * 768px breakpoint - they get the accordion and never download the renderer.
 */
export function mountDial(container, arcs) {
  const stage = document.createElement('div');
  stage.className = 'wheel__stage';
  container.appendChild(stage);

  const scene = createScene(stage);

  // --- Ambience ----------------------------------------------------------
  const ambience = createAmbience();
  scene.scene.add(ambience.group);
  // No ambient drift under reduced motion - the loop only wakes for state changes.
  scene.onFrame((delta) => {
    if (!prefersReducedMotion()) ambience.update(delta);
  });

  // --- Arcs and nodes ----------------------------------------------------
  const arcViews = arcs.map((arc) => {
    const view = createArc(arc);
    scene.scene.add(view.group);
    return view;
  });

  const nodeViews = arcs.map((arc) =>
    arc.nodes.map((node) => {
      const view = createNode(node, arc);
      scene.scene.add(view.group);
      return view;
    })
  );

  const arcTargets = arcViews.map((view) => view.pickTarget);
  const nodeTargets = nodeViews.flat().map((view) => view.pickTarget);

  // --- DOM overlay -------------------------------------------------------
  const hub = createHub({ totalProjects: projects.length });
  stage.append(hub.hub, hub.label);

  const strip = hub.strip;
  container.appendChild(strip);

  // --- State -------------------------------------------------------------
  let activeArc = null;
  let hotNode = null; // { arcIndex, nodeIndex }
  let keyboardArc = null;

  function findNodeIndex(arcIndex, projectId) {
    if (arcIndex === null || !projectId) return null;
    const index = arcs[arcIndex].nodes.findIndex((n) => n.project.id === projectId);
    return index === -1 ? null : index;
  }

  function applyStates() {
    arcViews.forEach((view, i) => view.setActive(i === activeArc));
    ambience.setIntensity(activeArc === null ? 0 : 1);

    nodeViews.forEach((views, arcIndex) => {
      views.forEach((view, nodeIndex) => {
        const isHot =
          hotNode && hotNode.arcIndex === arcIndex && hotNode.nodeIndex === nodeIndex;
        if (isHot) view.setState('hot');
        else if (arcIndex === activeArc) view.setState('arc');
        else view.setState('rest');
      });
    });

    hub.setArc(activeArc === null ? null : arcs[activeArc]);
    keys.setActive(activeArc);

    if (hotNode) {
      const view = nodeViews[hotNode.arcIndex][hotNode.nodeIndex];
      const angle = view.node.angle;
      hub.setLabel(view.node.project.title, scene.toScreen(view.position), {
        x: Math.cos(angle),
        y: -Math.sin(angle), // screen Y runs the opposite way to world Y
      });
    } else {
      hub.setLabel(null, null, null);
    }

    scene.pulse();
  }

  function setHover({ arcIndex, projectId }) {
    // Keyboard focus outranks the pointer: if an arc is focused, hovering
    // elsewhere should not silently move the focused state out from under it.
    if (keyboardArc !== null && arcIndex === null) return;

    activeArc = arcIndex !== null ? arcIndex : keyboardArc;
    const nodeIndex = findNodeIndex(arcIndex, projectId);
    hotNode = nodeIndex === null ? null : { arcIndex, nodeIndex };
    applyStates();
  }

  function open(arcIndex, nodeIndex) {
    const entry = arcs[arcIndex] && arcs[arcIndex].nodes[nodeIndex];
    if (!entry) return;
    openProjectModal(entry.project, {
      onClose: () => {
        if (keyboardArc !== null) keys.focusArc(keyboardArc);
      },
    });
  }

  const pointer = createPointer({
    renderer: scene.renderer,
    camera: scene.camera,
    arcTargets,
    nodeTargets,
    onHover: setHover,
    onSelect: ({ arcIndex, projectId }) => {
      const nodeIndex = findNodeIndex(arcIndex, projectId);
      if (nodeIndex !== null) open(arcIndex, nodeIndex);
    },
  });

  // --- Keyboard ----------------------------------------------------------
  const keys = createKeyboardLayer({
    arcs,
    onArcFocus: (index) => {
      keyboardArc = index;
      activeArc = index;
      applyStates();
    },
    onArcBlur: (index) => {
      if (keyboardArc !== index) return;
      keyboardArc = null;
      activeArc = null;
      hotNode = null;
      nodeViews.flat().forEach((view) => view.setFocused(false));
      applyStates();
    },
    onCursor: (arcIndex, nodeIndex) => {
      nodeViews.flat().forEach((view) => view.setFocused(false));
      const view = nodeViews[arcIndex][nodeIndex];
      if (view) view.setFocused(true);
      hotNode = { arcIndex, nodeIndex };
      activeArc = arcIndex;
      applyStates();
    },
    onOpen: open,
  });

  stage.appendChild(keys.layer);
  container.appendChild(keys.live);

  // Labels are positioned from projected world coordinates, so they need to be
  // recomputed whenever the stage changes size.
  const resizeObserver = new ResizeObserver(() => applyStates());
  resizeObserver.observe(stage);

  applyStates();
  scene.start();

  return {
    destroy() {
      resizeObserver.disconnect();
      pointer.destroy();
      scene.dispose();
      disposeTextures();
      stage.remove();
      strip.remove();
      keys.live.remove();
      THREE.Cache.clear();
    },
  };
}

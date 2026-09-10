import * as THREE from 'three';
import { gsap, dur } from '../lib/motion.js';
import { iconTexture, glowTexture } from './textures.js';
import { NODE_RADIUS } from './layout.js';

/**
 * A project node: a dark disc, a ring in the category accent, a tintable glyph,
 * and an additive halo that only appears when the node is hovered, focused or
 * selected.
 *
 * The disc is deliberately slightly larger than it looks - the invisible pick
 * plane behind it gives the pointer a forgiving hit area.
 */

const REST_RING = 0x4a4358;
const REST_GLYPH = 0x8a8296;
const DISC = 0x120e1b;

export function createNode(node, arc) {
  const group = new THREE.Group();
  group.position.set(node.x, node.y, 0.02);

  const accent = new THREE.Color(arc.accent);
  const restRing = new THREE.Color(REST_RING);
  const restGlyph = new THREE.Color(REST_GLYPH);

  // Halo (behind everything, additive, hidden at rest)
  const haloMaterial = new THREE.MeshBasicMaterial({
    map: glowTexture(),
    color: accent,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), haloMaterial);
  halo.position.z = -0.005;

  // Disc
  const discMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(DISC) });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(NODE_RADIUS, 40), discMaterial);

  // Ring
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: restRing.clone(),
    transparent: true,
  });
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(NODE_RADIUS, NODE_RADIUS + 0.006, 40),
    ringMaterial
  );
  ring.position.z = 0.001;

  // Glyph
  const glyphMaterial = new THREE.MeshBasicMaterial({
    map: iconTexture(arc.icon),
    color: restGlyph.clone(),
    transparent: true,
    depthWrite: false,
  });
  const glyph = new THREE.Mesh(
    new THREE.PlaneGeometry(NODE_RADIUS * 1.35, NODE_RADIUS * 1.35),
    glyphMaterial
  );
  glyph.position.z = 0.002;

  // Focus ring - keyboard only, drawn outside the node.
  const focusMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0,
  });
  const focusRing = new THREE.Mesh(
    new THREE.RingGeometry(NODE_RADIUS + 0.018, NODE_RADIUS + 0.024, 44),
    focusMaterial
  );
  focusRing.position.z = 0.003;

  // Generous invisible pick target.
  const pick = new THREE.Mesh(
    new THREE.CircleGeometry(NODE_RADIUS * 1.9, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  pick.userData.pickable = 'node';
  pick.userData.arcIndex = arc.index;
  pick.userData.projectId = node.project.id;

  group.add(halo, disc, ring, glyph, focusRing, pick);

  /**
   * Three visual states, resolved through one setter so hover and arc
   * highlighting can never fight over the same materials:
   *
   *   rest - the arc is idle
   *   arc  - this node's arc is active, but the pointer is elsewhere on it
   *   hot  - this exact node is hovered or keyboard-focused
   */
  const STATES = {
    rest: { ring: restRing, glyph: restGlyph, halo: 0, scale: 1 },
    arc: {
      ring: accent.clone().lerp(restRing, 0.35),
      glyph: new THREE.Color(0xcfc8dc),
      halo: 0.2,
      scale: 1.06,
    },
    hot: {
      ring: accent,
      glyph: new THREE.Color(0xf1eef6),
      halo: 0.55,
      scale: 1.18,
    },
  };

  const state = { name: 'rest', focused: false };

  function setState(name) {
    const next = STATES[name] ? name : 'rest';
    if (state.name === next) return;
    state.name = next;
    const target = STATES[next];

    gsap.to(ringMaterial.color, {
      r: target.ring.r,
      g: target.ring.g,
      b: target.ring.b,
      duration: dur(0.25),
    });
    gsap.to(glyphMaterial.color, {
      r: target.glyph.r,
      g: target.glyph.g,
      b: target.glyph.b,
      duration: dur(0.25),
    });
    gsap.to(haloMaterial, { opacity: target.halo, duration: dur(0.3) });
    gsap.to(group.scale, {
      x: target.scale,
      y: target.scale,
      duration: dur(0.3),
      ease: next === 'hot' ? 'back.out(2)' : 'power2.out',
    });
  }

  function setFocused(focused) {
    if (state.focused === focused) return;
    state.focused = focused;
    gsap.to(focusMaterial, { opacity: focused ? 1 : 0, duration: dur(0.15) });
  }

  return {
    group,
    pickTarget: pick,
    setState,
    setFocused,
    node,
    position: new THREE.Vector3(node.x, node.y, 0),
  };
}

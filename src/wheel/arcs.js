import * as THREE from 'three';
import { gsap, dur } from '../lib/motion.js';
import { R_INNER, R_OUTER } from './layout.js';

/**
 * One arc segment of the ring.
 *
 * Three layers, so hover has somewhere to go without the resting state being
 * loud: a near-monochrome fill, a hairline edge on the outer radius, and an
 * additive glow band that is fully transparent until the arc is active.
 */

const REST_FILL = 0x1a1526;
const REST_EDGE = 0x3a3348;
const SEGMENTS = 96;

export function createArc(arc) {
  const group = new THREE.Group();
  const accent = new THREE.Color(arc.accent);

  // --- Fill ---------------------------------------------------------------
  const fillGeometry = new THREE.RingGeometry(
    R_INNER,
    R_OUTER,
    SEGMENTS,
    1,
    arc.start,
    arc.span
  );
  const fillMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(REST_FILL),
    transparent: true,
    opacity: 0.95,
  });
  const fill = new THREE.Mesh(fillGeometry, fillMaterial);

  // --- Outer hairline -----------------------------------------------------
  const edgeGeometry = new THREE.RingGeometry(
    R_OUTER - 0.004,
    R_OUTER,
    SEGMENTS,
    1,
    arc.start,
    arc.span
  );
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(REST_EDGE),
    transparent: true,
    opacity: 1,
  });
  const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);

  // --- Glow band (additive, invisible at rest) ----------------------------
  const glowGeometry = new THREE.RingGeometry(
    R_INNER - 0.06,
    R_OUTER + 0.06,
    SEGMENTS,
    1,
    arc.start,
    arc.span
  );
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.z = -0.01;

  group.add(glow, fill, edge);

  // The fill is what the raycaster tests against.
  fill.userData.arcIndex = arc.index;
  fill.userData.pickable = 'arc';

  const state = { active: false };

  function setActive(active) {
    if (state.active === active) return;
    state.active = active;

    gsap.to(fillMaterial.color, {
      r: active ? accent.r * 0.22 + 0.06 : new THREE.Color(REST_FILL).r,
      g: active ? accent.g * 0.22 + 0.05 : new THREE.Color(REST_FILL).g,
      b: active ? accent.b * 0.22 + 0.09 : new THREE.Color(REST_FILL).b,
      duration: dur(0.3),
      ease: 'power2.out',
    });

    gsap.to(edgeMaterial.color, {
      r: active ? accent.r : new THREE.Color(REST_EDGE).r,
      g: active ? accent.g : new THREE.Color(REST_EDGE).g,
      b: active ? accent.b : new THREE.Color(REST_EDGE).b,
      duration: dur(0.3),
    });

    gsap.to(glowMaterial, {
      opacity: active ? 0.32 : 0,
      duration: dur(active ? 0.35 : 0.5),
      ease: 'power2.out',
    });
  }

  return { group, pickTarget: fill, setActive, arc };
}

import * as THREE from 'three';
import { glowTexture } from './textures.js';
import { R_INNER, R_OUTER } from './layout.js';

/**
 * Ambient atmosphere: faint and sparse on purpose.
 *
 * The reference feel is the soft bloom of a constellation skill tree, but the
 * wheel stays a clean ring - so there is no free-form node web here, only a
 * scatter of slow motes and a low hub bloom that keeps the centre from reading
 * as a hole.
 */

const MOTE_COUNT = 54;

export function createAmbience() {
  const group = new THREE.Group();
  group.position.z = -0.2;

  const texture = glowTexture();

  // --- Hub bloom ----------------------------------------------------------
  const hubMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: new THREE.Color(0x6a4b9c),
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hub = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), hubMaterial);
  group.add(hub);

  // --- Ring guide: ties the five arcs into one dial ------------------------
  const guideMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xf1eef6),
    transparent: true,
    opacity: 0.05,
  });
  const guide = new THREE.Mesh(
    new THREE.RingGeometry(R_INNER - 0.026, R_INNER - 0.023, 128),
    guideMaterial
  );
  group.add(guide);

  // --- Motes --------------------------------------------------------------
  const motes = [];
  const geometry = new THREE.PlaneGeometry(1, 1);

  for (let i = 0; i < MOTE_COUNT; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    // Cluster them loosely around the ring rather than filling the frame.
    const radius = R_INNER * 0.35 + Math.random() * (R_OUTER + 0.34 - R_INNER * 0.35);
    const scale = 0.02 + Math.random() * 0.055;
    const base = 0.05 + Math.random() * 0.16;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color(Math.random() > 0.65 ? 0x4c6fff : 0xa855f7),
      transparent: true,
      opacity: base,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(scale);
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    group.add(mesh);

    motes.push({
      mesh,
      material,
      base,
      angle,
      radius,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.008 + Math.random() * 0.022),
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.5 + Math.random() * 1.1,
    });
  }

  let elapsed = 0;

  function update(delta) {
    elapsed += delta;
    for (const mote of motes) {
      mote.angle += mote.speed * delta;
      mote.mesh.position.x = Math.cos(mote.angle) * mote.radius;
      mote.mesh.position.y = Math.sin(mote.angle) * mote.radius;
      mote.material.opacity =
        mote.base * (0.55 + 0.45 * Math.sin(elapsed * mote.twinkle + mote.phase));
    }
  }

  /** Lift the ambience slightly while an arc is active. */
  function setIntensity(value) {
    hubMaterial.opacity = 0.16 + value * 0.12;
  }

  return { group, update, setIntensity };
}

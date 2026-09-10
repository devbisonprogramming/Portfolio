import * as THREE from 'three';

/**
 * All wheel artwork is drawn procedurally to canvases - no image files to load,
 * nothing to 404, and the glyphs stay crisp because they are generated at the
 * device pixel ratio.
 *
 * Icons are drawn in WHITE on transparent so a MeshBasicMaterial can tint them
 * per state (muted at rest, category accent when active) without needing a
 * second texture.
 */

const SIZE = 128;
const cache = new Map();

function canvas(draw) {
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw(ctx, SIZE);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const ICONS = {
  // Networking - a packet passing through a boundary.
  packet: (ctx, s) => {
    const m = s * 0.26;
    ctx.strokeRect(m, m + s * 0.1, s - m * 2, s - m * 2 - s * 0.2);
    ctx.beginPath();
    ctx.moveTo(s * 0.12, s * 0.5);
    ctx.lineTo(s * 0.88, s * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.5, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  },

  // Data - a datastore drum.
  store: (ctx, s) => {
    const rx = s * 0.26;
    const ry = s * 0.1;
    const top = s * 0.28;
    const bottom = s * 0.72;
    ctx.beginPath();
    ctx.ellipse(s / 2, top, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s / 2 - rx, top);
    ctx.lineTo(s / 2 - rx, bottom);
    ctx.moveTo(s / 2 + rx, top);
    ctx.lineTo(s / 2 + rx, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s / 2, bottom, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
  },

  // Gameplay - a game controller.
  play: (ctx, s) => {
    ctx.beginPath();
    ctx.moveTo(s * 0.28, s * 0.43);
    ctx.quadraticCurveTo(s * 0.32, s * 0.28, s * 0.44, s * 0.32);
    ctx.lineTo(s * 0.56, s * 0.32);
    ctx.quadraticCurveTo(s * 0.68, s * 0.28, s * 0.72, s * 0.43);
    ctx.lineTo(s * 0.79, s * 0.63);
    ctx.quadraticCurveTo(s * 0.81, s * 0.75, s * 0.71, s * 0.75);
    ctx.quadraticCurveTo(s * 0.65, s * 0.75, s * 0.58, s * 0.64);
    ctx.lineTo(s * 0.42, s * 0.64);
    ctx.quadraticCurveTo(s * 0.35, s * 0.75, s * 0.29, s * 0.75);
    ctx.quadraticCurveTo(s * 0.19, s * 0.75, s * 0.21, s * 0.63);
    ctx.closePath();

    ctx.stroke();

    // D-pad
    ctx.beginPath();
    ctx.moveTo(s * 0.32, s * 0.47);
    ctx.lineTo(s * 0.32, s * 0.59);
    ctx.moveTo(s * 0.26, s * 0.53);
    ctx.lineTo(s * 0.38, s * 0.53);
    ctx.stroke();

    // Action buttons
    ctx.beginPath();
    ctx.arc(s * 0.65, s * 0.48, s * 0.035, 0, Math.PI * 2);
    ctx.arc(s * 0.72, s * 0.55, s * 0.035, 0, Math.PI * 2);
    ctx.stroke();
  },

  // UI - a panel with a rail and rows.
  panel: (ctx, s) => {
    const m = s * 0.24;
    ctx.strokeRect(m, m, s - m * 2, s - m * 2);
    ctx.beginPath();
    ctx.moveTo(s * 0.42, m);
    ctx.lineTo(s * 0.42, s - m);
    ctx.moveTo(s * 0.53, s * 0.42);
    ctx.lineTo(s * 0.7, s * 0.42);
    ctx.moveTo(s * 0.53, s * 0.58);
    ctx.lineTo(s * 0.7, s * 0.58);
    ctx.stroke();
  },

  // VFX - a four-point spark.
  spark: (ctx, s) => {
    const c = s / 2;
    const r = s * 0.3;
    const w = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(c, c - r);
    ctx.quadraticCurveTo(c + w, c - w, c + r, c);
    ctx.quadraticCurveTo(c + w, c + w, c, c + r);
    ctx.quadraticCurveTo(c - w, c + w, c - r, c);
    ctx.quadraticCurveTo(c - w, c - w, c, c - r);
    ctx.closePath();
    ctx.fill();
  },
};

/** Tintable glyph texture for a node. Falls back to the spark. */
export function iconTexture(key) {
  const name = ICONS[key] ? key : 'spark';
  const id = `icon:${name}`;
  if (!cache.has(id)) cache.set(id, canvas(ICONS[name]));
  return cache.get(id);
}

/** Soft radial falloff, used for node halos and the ambient motes. */
export function glowTexture() {
  const id = 'glow';
  if (!cache.has(id)) {
    cache.set(
      id,
      canvas((ctx, s) => {
        const gradient = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.35, 'rgba(255,255,255,0.38)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, s, s);
      })
    );
  }
  return cache.get(id);
}

/** Release every generated texture. Called when the wheel is torn down. */
export function disposeTextures() {
  cache.forEach((texture) => texture.dispose());
  cache.clear();
}

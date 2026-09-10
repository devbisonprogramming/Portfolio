/**
 * Images that cannot break.
 *
 * Every <img> on the site is created through here. If the file is missing, the
 * browser fires `error` and we swap in a generated placeholder: a flat panel in
 * the surface colour with the title centred in the mono family. No blank files
 * need to be pre-supplied, and a broken-image icon never renders.
 *
 * Drop the real screenshot into the matching folder later and it takes over
 * with no code change.
 */

const SURFACE = '#16111f';
const HAIRLINE = 'rgba(241, 238, 246, 0.10)';
const TEXT = '#8a8296';
const MONO = "600 {size}px 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const cache = new Map();

/** Resolve a path inside public/assets/images, honouring the Vite base URL. */
function assetUrl(relativePath) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/assets/images/${relativePath.replace(/^\//, '')}`;
}

/**
 * Draw a placeholder panel as a data URL.
 * @param {string} label   text centred in the panel
 * @param {number} width   css pixels
 * @param {number} height  css pixels
 */
function placeholder(label, width = 640, height = 400) {
  const key = `${label}|${width}x${height}`;
  if (cache.has(key)) return cache.get(key);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const size = Math.max(11, Math.min(16, Math.round(width / 26)));
  ctx.fillStyle = TEXT;
  ctx.font = MONO.replace('{size}', String(size));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap the label rather than letting a long title run off the panel.
  const maxWidth = width - size * 4;
  const words = String(label).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const lineHeight = size * 1.7;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((text, i) => {
    ctx.fillText(text, width / 2, startY + i * lineHeight);
  });

  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

/**
 * Build an <img> that falls back to a generated placeholder.
 *
 * @param {object}  options
 * @param {string}  options.src    path relative to assets/images
 * @param {string}  options.label  used as alt text and placeholder caption
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.className]
 * @param {boolean} [options.eager] load immediately instead of lazily - use
 *        for anything already on screen when it is created, such as the image
 *        inside a project modal, so the placeholder resolves without a delay
 */
export function image({
  src,
  label,
  width = 640,
  height = 400,
  className = '',
  eager = false,
}) {
  const img = document.createElement('img');
  img.className = className;
  img.alt = label;
  if (!eager) img.loading = 'lazy';
  img.decoding = 'async';
  img.width = width;
  img.height = height;

  img.addEventListener(
    'error',
    () => {
      // Guard against a placeholder that somehow fails to decode looping back.
      if (img.dataset.placeholder === 'true') return;
      img.dataset.placeholder = 'true';
      img.src = placeholder(label, width, height);
    },
    { once: true }
  );

  img.src = assetUrl(src);
  return img;
}

/**
 * A framed media block: fixed aspect ratio, hairline border, no drop shadow.
 * Returns the wrapper element.
 */
export function figure({ src, label, ratio = '16 / 10', className = '', eager = false }) {
  const wrap = document.createElement('div');
  wrap.className = `media ${className}`.trim();
  wrap.style.aspectRatio = ratio;
  wrap.appendChild(image({ src, label, className: 'media__img', eager }));
  return wrap;
}

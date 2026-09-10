import { prefersReducedMotion, onReducedMotionChange } from './motion.js';

/**
 * Ambient pixel field behind the page.
 *
 * Deliberately cheap: one fixed canvas, no DOM per particle, and a few dozen
 * `fillRect` calls per frame. The stars are pre-sorted by colour so the whole
 * field is drawn with roughly three `fillStyle` assignments, positions are
 * snapped to whole device pixels so every mote stays a crisp square rather
 * than a blurred dot, and the loop stops entirely when the tab is hidden.
 *
 * It reads as texture, not decoration: near-monochrome at rest, with the
 * violet and indigo accents kept faint and rare so the palette stays earned.
 * The pointer only nudges the field - the parallax is a couple of dozen pixels
 * at the front layer and nothing at all at the back.
 *
 * Under `prefers-reduced-motion` the field is painted once and left alone: the
 * texture survives, the drift and the pointer tracking do not.
 */

const MARGIN = 56; // off-screen band the stars wrap through
const DENSITY = 13000; // one star per this many CSS pixels of viewport
const MIN_STARS = 44;
const MAX_STARS = 170;

// depth, pixel size, base alpha. Three flat layers, back to front.
const LAYERS = [
  { depth: 0.3, size: 1, alpha: 0.2 },
  { depth: 0.62, size: 2, alpha: 0.3 },
  { depth: 1, size: 3, alpha: 0.42 },
];

const TINTS = [
  { rgb: '241, 238, 246', weight: 0.82, scale: 1 },
  { rgb: '168, 85, 247', weight: 0.11, scale: 0.62 },
  { rgb: '76, 111, 255', weight: 0.07, scale: 0.62 },
];

function pickTint() {
  let roll = Math.random();
  for (const tint of TINTS) {
    roll -= tint.weight;
    if (roll <= 0) return tint;
  }
  return TINTS[0];
}

export function mountStarfield(target = document.body) {
  const canvas = document.createElement('canvas');
  canvas.className = 'starfield';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });
  target.insertBefore(canvas, target.firstChild);

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];

  // Pointer parallax: `aim` is where the field wants to be, `offset` is where
  // it currently is. Easing between them is what stops the motes from snapping.
  const aim = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };

  let running = false;
  let frame = null;
  let last = 0;

  function starCount() {
    return Math.round(Math.min(MAX_STARS, Math.max(MIN_STARS, (width * height) / DENSITY)));
  }

  function build() {
    const count = starCount();

    stars = [];
    for (let i = 0; i < count; i += 1) {
      const layer = LAYERS[i % LAYERS.length];
      const tint = pickTint();
      const alpha = layer.alpha * tint.scale * (0.65 + Math.random() * 0.5);

      stars.push({
        x: Math.random() * (width + MARGIN * 2) - MARGIN,
        y: Math.random() * (height + MARGIN * 2) - MARGIN,
        depth: layer.depth,
        px: Math.max(1, Math.round(layer.size * dpr)),
        // Fall speed scales with depth, so the front layer reads as nearer.
        fall: (3 + Math.random() * 9) * layer.depth,
        sway: 3 + Math.random() * 7,
        swaySpeed: 0.12 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        color: `rgba(${tint.rgb}, ${alpha.toFixed(3)})`,
      });
    }

    // Sorting by colour collapses ~150 fillStyle writes down to about three.
    stars.sort((a, b) => (a.color < b.color ? -1 : a.color > b.color ? 1 : 0));
  }

  function resize() {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    if (nextWidth === width && nextHeight === height) return;

    width = nextWidth;
    height = nextHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Mobile browsers fire resize every time the address bar slides away.
    // Rebuilding there would reshuffle the whole field for a 60px change, so
    // the existing stars are kept and simply folded back into the new box
    // unless the viewport actually needs a different number of them.
    if (stars.length === 0 || stars.length !== starCount()) {
      build();
    } else {
      const spanX = width + MARGIN * 2;
      const spanY = height + MARGIN * 2;
      for (const star of stars) {
        star.x = ((((star.x + MARGIN) % spanX) + spanX) % spanX) - MARGIN;
        star.y = ((((star.y + MARGIN) % spanY) + spanY) % spanY) - MARGIN;
      }
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let fill = '';
    for (const star of stars) {
      // Whole device pixels only - a half-pixel square is a grey smear.
      const x = Math.round((star.x + offset.x * star.depth) * dpr);
      const y = Math.round((star.y + offset.y * star.depth) * dpr);
      if (star.color !== fill) {
        fill = star.color;
        ctx.fillStyle = fill;
      }
      ctx.fillRect(x, y, star.px, star.px);
    }
  }

  function step(delta, elapsed) {
    const span = height + MARGIN * 2;
    for (const star of stars) {
      star.y += star.fall * delta;
      if (star.y > height + MARGIN) star.y -= span;
      star.x += Math.sin(elapsed * star.swaySpeed + star.phase) * star.sway * delta;
    }

    // Frame-rate independent ease towards the pointer.
    const ease = 1 - Math.exp(-delta * 3.2);
    offset.x += (aim.x - offset.x) * ease;
    offset.y += (aim.y - offset.y) * ease;
  }

  function tick(now) {
    if (!running) return;
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    step(delta, now / 1000);
    draw();
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running || prefersReducedMotion() || document.hidden) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function onPointerMove(event) {
    if (prefersReducedMotion()) return;
    // A shallow push, and away from the cursor, so the field feels like depth
    // behind the page rather than something following the mouse around.
    aim.x = (0.5 - event.clientX / width) * 28;
    aim.y = (0.5 - event.clientY / height) * 18;
  }

  function onPointerLeave() {
    aim.x = 0;
    aim.y = 0;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function onMotionChange(reduced) {
    if (reduced) {
      stop();
      aim.x = aim.y = 0;
      offset.x = offset.y = 0;
      draw();
    } else {
      start();
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);
  const releaseMotion = onReducedMotionChange(onMotionChange);
  start();

  return {
    destroy() {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      releaseMotion();
      canvas.remove();
    },
  };
}

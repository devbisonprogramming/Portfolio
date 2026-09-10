import { gsap } from 'gsap';

/**
 * Motion policy for the site.
 *
 * The motion budget is spent almost entirely on the wheel. There are
 * deliberately NO generic section-reveal or card-hover-lift animations here -
 * everything outside the wheel changes state instantly or over ~120-200ms.
 *
 * Under `prefers-reduced-motion` every GSAP duration collapses to zero, so
 * animated code paths still run and still land on their final values; they
 * simply arrive immediately. Callers do not need to branch.
 */

const query =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

let reduced = query ? query.matches : false;

function apply() {
  gsap.defaults({
    ease: 'power2.out',
    duration: reduced ? 0 : 0.4,
    overwrite: 'auto',
  });
  gsap.globalTimeline.timeScale(reduced ? 1000 : 1);
}

apply();

if (query) {
  const onChange = (event) => {
    reduced = event.matches;
    apply();
    listeners.forEach((fn) => fn(reduced));
  };
  if (query.addEventListener) query.addEventListener('change', onChange);
  else query.addListener(onChange);
}

const listeners = new Set();

/** True when the visitor has asked for reduced motion. Read it live. */
export function prefersReducedMotion() {
  return reduced;
}

/** Subscribe to reduced-motion changes. Returns an unsubscribe function. */
export function onReducedMotionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Duration helper: collapses to 0 when reduced motion is on. */
export function dur(seconds) {
  return reduced ? 0 : seconds;
}

export { gsap };

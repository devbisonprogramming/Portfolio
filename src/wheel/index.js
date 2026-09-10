import { categories } from '../data/categories.js';
import { projectsInCategory } from '../data/projects.js';
import { buildLayout } from './layout.js';
import { createAccordion } from './accordion.js';

const MOBILE = '(max-width: 767px)';

/**
 * Mounts the Skill Wheel into `container`.
 *
 * Above 768px this is the Three.js dial. Below it, the same arcs and the same
 * projects render as an accordion and no WebGL context is created at all - the
 * radial interaction is not forced onto a small touch screen. Crossing the
 * breakpoint tears one down and builds the other rather than hiding either.
 *
 * The dial is a dynamic import, so Three.js is only fetched when a visitor is
 * actually going to see it. A phone downloads the accordion and nothing more.
 */
export function mountWheel(container) {
  const arcs = buildLayout(categories, projectsInCategory);
  const query = window.matchMedia(MOBILE);

  let current = null;
  // Guards against the breakpoint changing while the dial module is in flight.
  let token = 0;

  async function mount() {
    const mine = ++token;

    if (query.matches) {
      const accordion = createAccordion(arcs);
      if (mine !== token) return;
      container.appendChild(accordion.element);
      current = { destroy: () => accordion.destroy() };
      return;
    }

    const { mountDial } = await import('./dial.js');
    if (mine !== token) return;
    current = mountDial(container, arcs);
  }

  function teardown() {
    token += 1;
    if (current) current.destroy();
    current = null;
  }

  function remount() {
    teardown();
    mount();
  }

  mount();

  if (query.addEventListener) query.addEventListener('change', remount);
  else query.addListener(remount);

  return {
    destroy() {
      if (query.removeEventListener) query.removeEventListener('change', remount);
      else query.removeListener(remount);
      teardown();
    },
  };
}

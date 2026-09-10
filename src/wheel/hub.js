import { gsap, dur } from '../lib/motion.js';

/**
 * The DOM layer that sits on top of the canvas: the hub readout in the centre
 * of the dial, the description strip beneath it, and the floating label that
 * follows the hovered or focused node.
 *
 * Text stays in the DOM rather than being drawn into WebGL so it is
 * selectable, scales with the user's font settings, and is available to
 * assistive technology.
 */
export function createHub({ totalProjects }) {
  // --- Hub ----------------------------------------------------------------
  const hub = document.createElement('div');
  hub.className = 'wheel__hub';
  hub.setAttribute('aria-hidden', 'true');

  const hubTitle = document.createElement('span');
  hubTitle.className = 'wheel__hub-title';

  const hubMeta = document.createElement('span');
  hubMeta.className = 'wheel__hub-meta mono';

  hub.append(hubTitle, hubMeta);

  const restTitle = 'Bison (@DevBison)';
  const restMeta = `${totalProjects} project examples`;
  hubTitle.textContent = restTitle;
  hubMeta.textContent = restMeta;

  // --- Description strip --------------------------------------------------
  const strip = document.createElement('div');
  strip.className = 'wheel__strip';

  const stripText = document.createElement('p');
  stripText.className = 'wheel__strip-text';
  stripText.textContent =
    'Hover an arc to read what that sector covers, then open a node for the system behind it.';
  strip.appendChild(stripText);

  // --- Floating node label ------------------------------------------------
  const label = document.createElement('div');
  label.className = 'wheel__node-label mono';
  label.setAttribute('aria-hidden', 'true');
  label.style.opacity = '0';

  let currentArc = null;

  function setArc(arc) {
    if (arc === currentArc) return;
    currentArc = arc;

    const title = arc ? arc.name : restTitle;
    const meta = arc
      ? `${String(arc.nodes.length).padStart(2, '0')} ${arc.nodes.length === 1 ? 'system' : 'systems'}`
      : restMeta;
    const body = arc && arc.blurb ? arc.blurb : stripText.dataset.rest || stripText.textContent;

    if (!stripText.dataset.rest) stripText.dataset.rest = stripText.textContent;

    hub.style.setProperty('--hub-accent', arc ? arc.accent : 'var(--text-muted)');

    // Cross-fade rather than slide: the wheel is already the moving element.
    gsap.to([hubTitle, hubMeta], {
      opacity: 0,
      duration: dur(0.12),
      onComplete: () => {
        hubTitle.textContent = title;
        hubMeta.textContent = meta;
        gsap.to([hubTitle, hubMeta], { opacity: 1, duration: dur(0.18) });
      },
    });

    gsap.to(stripText, {
      opacity: 0,
      duration: dur(0.12),
      onComplete: () => {
        stripText.textContent = body;
        gsap.to(stripText, { opacity: 1, duration: dur(0.18) });
      },
    });
  }

  /**
   * @param {string|null} text project title, or null to hide the label
   * @param {{x:number,y:number}|null} position node centre, in stage pixels
   * @param {{x:number,y:number}|null} direction unit vector pointing out of the
   *   hub, in screen space. The label is shifted a full half-box along it, so a
   *   node at the bottom of the dial gets its label below the ring rather than
   *   dropped back across it.
   */
  function setLabel(text, position, direction) {
    if (!text || !position) {
      gsap.to(label, { opacity: 0, duration: dur(0.15) });
      return;
    }
    label.textContent = text;

    const dx = direction ? direction.x : 0;
    const dy = direction ? direction.y : -1;
    label.style.transform =
      `translate(${position.x}px, ${position.y}px)` +
      ` translate(calc(-50% + 50% * ${dx.toFixed(4)}), calc(-50% + 50% * ${dy.toFixed(4)}))` +
      ` translate(${(dx * 0.5).toFixed(3)}rem, ${(dy * 0.5).toFixed(3)}rem)`;

    gsap.to(label, { opacity: 1, duration: dur(0.15) });
  }

  return { hub, strip, label, setArc, setLabel };
}

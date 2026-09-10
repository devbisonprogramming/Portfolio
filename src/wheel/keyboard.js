import { VIEW } from './scene.js';

/**
 * The keyboard and assistive-technology layer for the dial.
 *
 * WebGL has no accessibility tree, so the arcs also exist as real DOM buttons
 * positioned over the canvas. They carry `pointer-events: none`, which leaves
 * mouse raycasting untouched while keeping them tabbable and giving them a
 * native focus ring.
 *
 *   Tab / Shift+Tab   move between arcs
 *   Arrow keys        move between the nodes on the focused arc
 *   Home / End        first / last node on the arc
 *   Enter or Space    open the focused node
 *
 * A polite live region announces the node under the cursor so a screen-reader
 * user hears the same information a sighted user reads from the hub.
 */
export function createKeyboardLayer({ arcs, onArcFocus, onArcBlur, onCursor, onOpen }) {
  const layer = document.createElement('div');
  layer.className = 'wheel__a11y';

  const live = document.createElement('div');
  live.className = 'visually-hidden';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  const buttons = [];
  const cursors = arcs.map(() => 0);

  // The stage is locked to a square aspect ratio, so world units map straight
  // onto percentages of the container.
  const toPercent = (value) => 50 + (value / (2 * VIEW)) * 100;

  arcs.forEach((arc, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wheel__arc-button';
    button.style.left = `${toPercent(arc.labelX)}%`;
    button.style.top = `${toPercent(-arc.labelY)}%`;

    // The label is anchored just outside the ring and then shifted outward by
    // half its own box along the arc's radial direction, so a wrapped label
    // grows away from the dial instead of overlapping it. `--dy` is negated
    // because screen Y runs the opposite way to world Y.
    button.style.setProperty('--dx', arc.labelDirX.toFixed(4));
    button.style.setProperty('--dy', (-arc.labelDirY).toFixed(4));
    // Labels at three and nine o'clock have the most horizontal room; the ones
    // at the top and bottom of the dial have the least, so they wrap sooner.
    button.style.setProperty('--label-w', `${(6.5 + Math.abs(arc.labelDirX) * 3.5).toFixed(2)}rem`);

    const count = arc.nodes.length;
    button.setAttribute(
      'aria-label',
      `${arc.name}. ${count} ${count === 1 ? 'system' : 'systems'}. ` +
        'Use the arrow keys to move between systems, then Enter to open one.'
    );

    const text = document.createElement('span');
    text.className = 'wheel__arc-button-text';
    text.textContent = arc.name;
    text.setAttribute('aria-hidden', 'true');
    button.appendChild(text);

    button.addEventListener('focus', () => {
      cursors[index] = 0;
      onArcFocus(index);
      onCursor(index, 0);
      announce(index, 0);
    });

    button.addEventListener('blur', () => {
      onArcBlur(index);
    });

    button.addEventListener('keydown', (event) => {
      const total = arc.nodes.length;
      if (total === 0) return;

      let next = cursors[index];
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (next + 1) % total;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = (next - 1 + total) % total;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = total - 1;
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          onOpen(index, cursors[index]);
          return;
        default:
          return;
      }

      event.preventDefault();
      cursors[index] = next;
      onCursor(index, next);
      announce(index, next);
    });

    // A click can only come from a keyboard activation or AT, since the layer
    // does not receive pointer events.
    button.addEventListener('click', (event) => {
      if (event.detail === 0) onOpen(index, cursors[index]);
    });

    buttons.push(button);
    layer.appendChild(button);
  });

  function announce(arcIndex, nodeIndex) {
    const arc = arcs[arcIndex];
    const node = arc.nodes[nodeIndex];
    if (!node) return;
    live.textContent = `${node.project.title}. ${nodeIndex + 1} of ${arc.nodes.length} in ${arc.name}.`;
  }

  /** Return focus to an arc button, e.g. after the modal closes. */
  function focusArc(index) {
    const button = buttons[index];
    if (button) button.focus();
  }

  /**
   * Mirror the canvas's active arc onto its label. The buttons take no pointer
   * events, so a label cannot brighten on its own when the arc under the mouse
   * lights up - the dial has to tell it.
   */
  function setActive(index) {
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
    });
  }

  return { layer, live, focusArc, setActive };
}

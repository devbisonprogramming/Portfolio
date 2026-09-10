const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keep Tab inside `container` until released. Returns a function that removes
 * the trap and returns focus to wherever it was before.
 */
export function trapFocus(container) {
  const previous = document.activeElement;

  const focusable = () =>
    Array.from(container.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );

  function onKeydown(event) {
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKeydown);

  const initial = focusable()[0] || container;
  if (initial === container) container.setAttribute('tabindex', '-1');
  initial.focus({ preventScroll: true });

  return function release() {
    container.removeEventListener('keydown', onKeydown);
    if (previous && typeof previous.focus === 'function') {
      previous.focus({ preventScroll: true });
    }
  };
}

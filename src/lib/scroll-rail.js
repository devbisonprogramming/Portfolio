/**
 * The page's scroll indicator, replacing the native scrollbar.
 *
 * A short column of pixels down the right edge: the ones above the current
 * position are lit, the one at the position is bright, the rest are dim. It is
 * the same square-pixel vocabulary as the mono type and the ambient field, and
 * it does not change width the way a native scrollbar does - which is what was
 * making the page jump when the project overlay locked and released the body.
 *
 * Hiding the native bar would also take drag-to-scroll away, so the rail is
 * draggable itself: press anywhere on it and the page follows the pointer.
 */

const CELL_PITCH = 9; // px between cell centres, matching the 3px cell + gap
const MIN_CELLS = 10;
const MAX_CELLS = 30;

export function mountScrollRail(target = document.body) {
  const rail = document.createElement('div');
  rail.className = 'scroll-rail';
  rail.setAttribute('aria-hidden', 'true');
  target.appendChild(rail);

  const doc = document.documentElement;
  let cells = [];
  let lit = -1;
  let queued = false;

  function maxScroll() {
    return Math.max(0, doc.scrollHeight - doc.clientHeight);
  }

  function buildCells() {
    const wanted = Math.max(
      MIN_CELLS,
      Math.min(MAX_CELLS, Math.round((window.innerHeight * 0.4) / CELL_PITCH))
    );
    if (wanted === cells.length) return;

    rail.textContent = '';
    cells = [];
    for (let i = 0; i < wanted; i += 1) {
      const cell = document.createElement('span');
      cell.className = 'scroll-rail__cell';
      rail.appendChild(cell);
      cells.push(cell);
    }
    lit = -1;
  }

  function paint() {
    queued = false;
    const max = maxScroll();
    // Nothing to indicate on a page that does not scroll.
    rail.classList.toggle('is-idle', max < 1);
    if (max < 1) return;

    const progress = Math.min(1, Math.max(0, doc.scrollTop / max));
    const head = Math.round(progress * (cells.length - 1));
    if (head === lit) return;
    lit = head;

    cells.forEach((cell, i) => {
      cell.classList.toggle('is-filled', i < head);
      cell.classList.toggle('is-head', i === head);
    });
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  // --- Drag to scroll -----------------------------------------------------

  function scrollToPointer(event) {
    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    // `instant` on purpose: the page has smooth scrolling for anchor links,
    // and inheriting it here would make the rail feel like it lags the finger.
    window.scrollTo({ top: ratio * maxScroll(), behavior: 'instant' });
  }

  function onPointerDown(event) {
    if (event.button !== 0 || maxScroll() < 1) return;
    event.preventDefault();
    rail.setPointerCapture(event.pointerId);
    rail.classList.add('is-dragging');
    scrollToPointer(event);
  }

  function onPointerMove(event) {
    if (!rail.hasPointerCapture(event.pointerId)) return;
    scrollToPointer(event);
  }

  function onPointerUp(event) {
    if (!rail.hasPointerCapture(event.pointerId)) return;
    rail.releasePointerCapture(event.pointerId);
    rail.classList.remove('is-dragging');
  }

  function onResize() {
    buildCells();
    schedule();
  }

  buildCells();
  paint();

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  rail.addEventListener('pointerdown', onPointerDown);
  rail.addEventListener('pointermove', onPointerMove);
  rail.addEventListener('pointerup', onPointerUp);
  rail.addEventListener('pointercancel', onPointerUp);

  // The document grows as images and the wheel settle in; re-measure when it does.
  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);

  return {
    destroy() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      rail.remove();
    },
  };
}

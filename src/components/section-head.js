/**
 * Section heading: a mono index number beside the heading rather than an
 * all-caps eyebrow label above it.
 *
 * @param {string} index  e.g. '02'
 * @param {string} title
 * @param {string} [lede] optional single supporting sentence
 */
export function sectionHead(index, title, lede) {
  const head = document.createElement('div');
  head.className = 'section-head';

  const idx = document.createElement('span');
  idx.className = 'section-head__index';
  idx.setAttribute('aria-hidden', 'true');
  idx.textContent = index;

  const text = document.createElement('div');
  text.className = 'section-head__text';

  const h2 = document.createElement('h2');
  h2.textContent = title;
  text.appendChild(h2);

  if (lede) {
    const p = document.createElement('p');
    p.textContent = lede;
    text.appendChild(p);
  }

  head.append(idx, text);
  return head;
}

import { pricing } from '../data/pricing.js';
import { sectionHead } from '../components/section-head.js';

/** Robux mark. Never a dollar sign - these are not real-world currency. */
function robuxMark() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('robux');
  svg.innerHTML =
    '<path fill="currentColor" d="M3.6 0 0 12.4 12.4 16 16 3.6 3.6 0Zm2.1 5.3 5 1.45-1.45 5-5-1.45 1.45-5Z"/>';
  return svg;
}

export function pricingSection() {
  const section = document.createElement('section');
  section.className = 'section pricing';
  section.id = 'pricing';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(
    sectionHead(
      '04',
      'Pricing',
      'All figures are in Robux. Tiers are a starting point, not a fixed menu.'
    )
  );

  const grid = document.createElement('div');
  grid.className = 'pricing__grid';

  pricing.tiers.forEach((tier) => {
    const card = document.createElement('article');
    card.className = `tier${tier.emphasis ? ' tier--emphasis' : ''}`;

    const name = document.createElement('h3');
    name.className = 'tier__name';
    name.textContent = tier.name;

    const time = document.createElement('p');
    time.className = 'tier__time mono';
    time.textContent = tier.time;

    const price = document.createElement('p');
    price.className = 'tier__price mono';
    price.append(robuxMark());
    price.append(document.createTextNode(tier.price));

    const includes = document.createElement('ul');
    includes.className = 'tier__includes';
    tier.includes.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      includes.appendChild(li);
    });

    const bestFor = document.createElement('p');
    bestFor.className = 'tier__best';
    bestFor.innerHTML = `<span class="tier__best-label mono">Best for</span> ${tier.bestFor}`;

    card.append(name, time, price, includes, bestFor);
    grid.appendChild(card);
  });

  const footnote = document.createElement('p');
  footnote.className = 'pricing__footnote';
  footnote.textContent = pricing.footnote;

  shell.append(grid, footnote);
  section.appendChild(shell);
  return section;
}

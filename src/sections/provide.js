import { site } from '../data/site.js';
import { sectionHead } from '../components/section-head.js';

/**
 * Short positioning section bridging the hero to the wheel. Rendered as a
 * numbered spec list with hairline rules rather than four identical cards.
 */
export function provideSection() {
  const section = document.createElement('section');
  section.className = 'section provide';
  section.id = 'provide';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(sectionHead('01', 'What I provide'));

  const list = document.createElement('ol');
  list.className = 'provide__list';

  site.provides.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'provide__item';

    const num = document.createElement('span');
    num.className = 'provide__num mono';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');

    const text = document.createElement('span');
    text.className = 'provide__text';
    text.textContent = item;

    li.append(num, text);
    list.appendChild(li);
  });

  shell.appendChild(list);
  section.appendChild(shell);
  return section;
}

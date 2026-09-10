import { site } from '../data/site.js';
import { sectionHead } from '../components/section-head.js';

/**
 * Deliberately short. No testimonials section and no placeholder for one, no
 * client counts, no borrowed metrics.
 */
export function aboutSection() {
  const section = document.createElement('section');
  section.className = 'section about';
  section.id = 'about';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(sectionHead('05', 'About'));

  const body = document.createElement('div');
  body.className = 'about__body';

  site.about.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    body.appendChild(p);
  });

  shell.appendChild(body);
  section.appendChild(shell);
  return section;
}

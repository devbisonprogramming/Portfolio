import { site } from '../data/site.js';
import { sectionHead } from '../components/section-head.js';
import { mountWheel } from '../wheel/index.js';

export function wheelSection() {
  const section = document.createElement('section');
  section.className = 'section wheel-section';
  section.id = 'work';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(sectionHead('02', 'My work', 'Browse some of my projects below.'));

  const mount = document.createElement('div');
  mount.className = 'wheel';
  shell.appendChild(mount);

  // A note beside the wheel, for the work that is not on it.
  const supplementary = document.createElement('aside');
  supplementary.className = 'supplementary';

  const supTitle = document.createElement('h3');
  supTitle.className = 'supplementary__title';
  supTitle.textContent = site.supplementary.title;

  const supBody = document.createElement('p');
  supBody.className = 'supplementary__body';
  supBody.textContent = site.supplementary.body;

  supplementary.append(supTitle, supBody);
  shell.appendChild(supplementary);

  section.appendChild(shell);

  // Mounted synchronously rather than inside requestAnimationFrame: rAF is
  // throttled in a backgrounded tab, which would leave the wheel unmounted
  // until the tab was first looked at. The scene measures itself through a
  // ResizeObserver, so it does not need layout to have settled first.
  mountWheel(mount);

  return section;
}

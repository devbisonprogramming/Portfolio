import { site } from '../data/site.js';
import { sectionHead } from '../components/section-head.js';
import { figure } from '../components/media.js';

export function gamesSection() {
  const section = document.createElement('section');
  section.className = 'section games';
  section.id = 'games';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(sectionHead('03', 'Recent games shipped'));

  site.games.forEach((game) => {
    const article = document.createElement('article');
    article.className = 'game';

    article.appendChild(
      figure({
        src: game.image,
        label: game.title,
        ratio: '16 / 10',
        className: 'media--game',
      })
    );

    const body = document.createElement('div');
    body.className = 'game__body';

    const title = document.createElement('h3');
    title.className = 'game__title';
    title.textContent = game.title;

    const role = document.createElement('p');
    role.className = 'game__role';
    role.textContent = game.role;

    const description = document.createElement('p');
    description.className = 'game__description';
    description.textContent = game.description;

    // Stated plainly, with the caveat attached rather than buried.
    const stat = document.createElement('div');
    stat.className = 'game__stat';

    const visits = document.createElement('span');
    visits.className = 'game__visits mono';
    visits.textContent = game.visits;

    const note = document.createElement('span');
    note.className = 'game__visits-note';
    note.textContent = game.visitsNote;

    stat.append(visits, note);

    const link = document.createElement('a');
    link.className = 'btn game__link';
    link.href = game.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open on Roblox';

    body.append(title, role, description, stat, link);
    article.appendChild(body);
    shell.appendChild(article);
  });

  section.appendChild(shell);
  return section;
}

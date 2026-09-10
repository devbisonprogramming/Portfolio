import { openProjectModal } from '../components/project-modal.js';

/**
 * The under-768px form of the wheel.
 *
 * A radial dial is a bad fit for a thumb on a small screen, so below the
 * breakpoint the same data renders as a vertical accordion: one row per
 * category, the same blurb, the same nodes, and the same project modal. No
 * Three.js is created at all on this path.
 */
export function createAccordion(arcs) {
  const root = document.createElement('div');
  root.className = 'accordion';

  arcs.forEach((arc, index) => {
    const item = document.createElement('section');
    item.className = 'accordion__item';
    item.style.setProperty('--arc-accent', arc.accent);

    const headingId = `acc-head-${index}`;
    const panelId = `acc-panel-${index}`;

    const heading = document.createElement('h3');
    heading.className = 'accordion__heading';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'accordion__trigger';
    trigger.id = headingId;
    trigger.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    trigger.setAttribute('aria-controls', panelId);

    const name = document.createElement('span');
    name.className = 'accordion__name';
    name.textContent = arc.name;

    const count = document.createElement('span');
    count.className = 'accordion__count mono';
    count.textContent = String(arc.nodes.length).padStart(2, '0');

    const chevron = document.createElement('span');
    chevron.className = 'accordion__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML =
      '<svg viewBox="0 0 12 12" width="12" height="12" focusable="false"><path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    trigger.append(count, name, chevron);
    heading.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'accordion__panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', headingId);
    panel.hidden = index !== 0;

    if (arc.blurb) {
      const blurb = document.createElement('p');
      blurb.className = 'accordion__blurb';
      blurb.textContent = arc.blurb;
      panel.appendChild(blurb);
    }

    const list = document.createElement('ul');
    list.className = 'accordion__list';

    arc.nodes.forEach(({ project }) => {
      const li = document.createElement('li');
      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'accordion__project';

      const title = document.createElement('span');
      title.className = 'accordion__project-title';
      title.textContent = project.title;

      const description = document.createElement('span');
      description.className = 'accordion__project-desc';
      description.textContent = project.description;

      openButton.append(title, description);
      openButton.addEventListener('click', () => {
        openProjectModal(project, { onClose: () => openButton.focus() });
      });

      li.appendChild(openButton);
      list.appendChild(li);
    });

    panel.appendChild(list);

    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });

    item.append(heading, panel);
    root.appendChild(item);
  });

  return {
    element: root,
    destroy() {
      root.remove();
    },
  };
}

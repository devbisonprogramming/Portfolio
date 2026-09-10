import { figure } from './media.js';
import { gallery } from './gallery.js';
import { categoryStyle } from '../data/categories.js';
import { trapFocus } from '../lib/focus-trap.js';
import { gsap, dur } from '../lib/motion.js';

/**
 * Project detail overlay. One root is created lazily and reused, so opening a
 * node never accumulates DOM. Escape or a click on the backdrop closes it, and
 * focus returns to the wheel arc (or accordion row) that opened it.
 */

let root = null;
let release = null;
let onCloseCallback = null;

function build() {
  root = document.createElement('div');
  root.className = 'modal';
  root.hidden = true;
  root.innerHTML = `
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal__close" type="button" data-close aria-label="Close project details">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
      <div class="modal__body"></div>
    </div>
  `;

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !root.hidden) close();
  });

  document.body.appendChild(root);
}

export function openProjectModal(project, { onClose } = {}) {
  if (!root) build();
  onCloseCallback = onClose || null;

  const style = categoryStyle(project.category);
  const body = root.querySelector('.modal__body');
  body.innerHTML = '';
  root.querySelector('.modal__panel').style.setProperty('--project-accent', style.accent);

  // --- Header -----------------------------------------------------------
  const header = document.createElement('header');
  header.className = 'modal__header';

  const cat = document.createElement('span');
  cat.className = 'modal__category mono';
  cat.textContent = project.category;

  const title = document.createElement('h3');
  title.id = 'modal-title';
  title.className = 'modal__title';
  title.textContent = project.title;

  header.append(cat, title);

  if (project.flagship) {
    const flag = document.createElement('span');
    flag.className = 'modal__flagship mono';
    flag.textContent = 'Flagship';
    header.appendChild(flag);
  }

  if (project.note) {
    const note = document.createElement('p');
    note.className = 'modal__note';
    note.textContent = project.note;
    header.appendChild(note);
  }

  body.appendChild(header);

  // --- Media ------------------------------------------------------------
  if (project.mediaType === 'gallery') {
    body.appendChild(gallery(project));
  } else {
    body.appendChild(
      figure({
        src: `projects/${project.id}.png`,
        label: project.title,
        className: 'media--modal',
        eager: true,
      })
    );
  }

  // --- Copy -------------------------------------------------------------
  const description = document.createElement('p');
  description.className = 'modal__description';
  description.textContent = project.description;
  body.appendChild(description);

  if (project.features && project.features.length) {
    const list = document.createElement('ul');
    list.className = 'modal__features';
    project.features.forEach((feature) => {
      const li = document.createElement('li');
      li.textContent = feature;
      list.appendChild(li);
    });
    body.appendChild(list);
  }

  if (project.githubUrl) {
    const link = document.createElement('a');
    link.className = 'btn modal__repo';
    link.href = project.githubUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33C3.81 14.35 3.34 12.8 3.34 12.8c-.36-.93-.89-1.18-.89-1.18-.72-.5.06-.49.06-.49.8.06 1.22.83 1.22.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      View source on GitHub
    `;
    body.appendChild(link);
  }

  // --- Show -------------------------------------------------------------
  root.hidden = false;
  document.body.style.overflow = 'hidden';

  gsap.fromTo(
    root.querySelector('.modal__panel'),
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: dur(0.28), ease: 'power3.out' }
  );
  gsap.fromTo(
    root.querySelector('.modal__backdrop'),
    { opacity: 0 },
    { opacity: 1, duration: dur(0.2) }
  );

  release = trapFocus(root.querySelector('.modal__panel'));
}

export function close() {
  if (!root || root.hidden) return;

  let finished = false;
  const finish = () => {
    // Idempotent: whichever of the two triggers below arrives first wins.
    if (finished) return;
    finished = true;

    root.hidden = true;
    document.body.style.overflow = '';
    if (release) {
      release();
      release = null;
    }
    if (onCloseCallback) {
      onCloseCallback();
      onCloseCallback = null;
    }
  };

  gsap.to(root.querySelector('.modal__panel'), {
    opacity: 0,
    y: 8,
    duration: dur(0.18),
    ease: 'power2.in',
    onComplete: finish,
  });
  gsap.to(root.querySelector('.modal__backdrop'), { opacity: 0, duration: dur(0.18) });

  // Safety net: GSAP's ticker runs on requestAnimationFrame, which a browser
  // throttles in a backgrounded tab. Closing the dialog - and releasing the
  // scroll lock it put on <body> - must never depend on an animation frame
  // arriving, so the state change is also committed on a plain timer.
  setTimeout(finish, dur(0.18) * 1000 + 60);
}


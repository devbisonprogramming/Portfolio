import { site } from '../data/site.js';
import { sectionHead } from '../components/section-head.js';
import { availabilityBadge } from '../components/availability.js';

const discordIcon = `
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.25.45c1.6.38 2.9 1 4.1 1.9a13.9 13.9 0 0 0-10.5 0c1.2-.9 2.5-1.52 4.1-1.9L12.6 3a19.8 19.8 0 0 0-4.9 1.4C4.6 8.9 3.75 13.3 4.17 17.6a19.9 19.9 0 0 0 6 3l.8-1.14a13 13 0 0 1-1.9-.92l.47-.36a14.2 14.2 0 0 0 12.1 0l.47.36c-.6.36-1.24.67-1.9.92l.8 1.14a19.9 19.9 0 0 0 6-3c.5-5-.85-9.35-3.5-13.2ZM9.7 15.1c-1.16 0-2.12-1.06-2.12-2.37 0-1.3.94-2.37 2.12-2.37 1.19 0 2.14 1.07 2.12 2.37 0 1.31-.94 2.37-2.12 2.37Zm4.6 0c-1.16 0-2.12-1.06-2.12-2.37 0-1.3.94-2.37 2.12-2.37 1.19 0 2.14 1.07 2.13 2.37 0 1.31-.94 2.37-2.13 2.37Z"/>
  </svg>
`;

/**
 * Discord only. No contact form, and no global GitHub profile link - repo
 * links stay scoped to the individual projects that have them.
 */
export function contactSection() {
  const section = document.createElement('section');
  section.className = 'section contact';
  section.id = 'contact';

  const shell = document.createElement('div');
  shell.className = 'shell';

  shell.appendChild(sectionHead('06', 'Get in touch'));

  const body = document.createElement('div');
  body.className = 'contact__body';

  const copy = document.createElement('p');
  copy.className = 'contact__copy';
  copy.textContent = site.contact.body;

  const actions = document.createElement('div');
  actions.className = 'contact__actions';

  const { discordUrl, discordLabel, discordHandle } = site.contact;

  if (discordUrl) {
    const link = document.createElement('a');
    link.className = 'btn btn--primary contact__discord';
    link.href = discordUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `${discordIcon}<span>${discordLabel}</span>`;
    actions.appendChild(link);
  } else {
    // No link supplied yet - render inert rather than pointing at nothing.
    const placeholder = document.createElement('span');
    placeholder.className = 'btn contact__discord';
    placeholder.setAttribute('aria-disabled', 'true');
    placeholder.innerHTML = `${discordIcon}<span>Discord link coming soon</span>`;
    actions.appendChild(placeholder);
  }

  if (discordHandle) {
    const handle = document.createElement('span');
    handle.className = 'contact__handle mono';
    handle.textContent = discordHandle;
    actions.appendChild(handle);
  }

  actions.appendChild(availabilityBadge());

  body.append(copy, actions);
  shell.appendChild(body);
  section.appendChild(shell);
  return section;
}

/**
 * The footer carries the AI disclosure. It is set small and muted on purpose -
 * it belongs on the page as a statement of how the work is made, not as a
 * feature being advertised.
 */
export function footer() {
  const el = document.createElement('footer');
  el.className = 'footer';

  const shell = document.createElement('div');
  shell.className = 'shell footer__shell';

  const policy = document.createElement('p');
  policy.className = 'footer__policy';

  const policyLabel = document.createElement('span');
  policyLabel.className = 'footer__policy-label mono';
  policyLabel.textContent = site.aiPolicy.label;

  const policyBody = document.createElement('span');
  policyBody.textContent = site.aiPolicy.body;

  policy.append(policyLabel, policyBody);

  const meta = document.createElement('div');
  meta.className = 'footer__meta';

  const mark = document.createElement('span');
  mark.className = 'mono';
  mark.textContent = site.wordmark;

  const year = document.createElement('span');
  year.className = 'mono';
  year.textContent = String(new Date().getFullYear());

  meta.append(mark, year);

  shell.append(policy, meta);
  el.appendChild(shell);
  return el;
}

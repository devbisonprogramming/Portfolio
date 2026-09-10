import { site } from '../data/site.js';
import { availabilityBadge } from '../components/availability.js';

export function heroSection() {
  const section = document.createElement('header');
  section.className = 'hero';
  section.id = 'top';

  const shell = document.createElement('div');
  shell.className = 'shell hero__shell';

  // Wordmark sits on its own line as identification, not as a caps eyebrow.
  const wordmark = document.createElement('div');
  wordmark.className = 'hero__wordmark mono';
  wordmark.textContent = site.wordmark;

  const heading = document.createElement('h1');
  heading.className = 'hero__title';
  heading.textContent = `${site.role}.`;

  const tagline = document.createElement('p');
  tagline.className = 'hero__tagline';
  tagline.textContent = site.tagline;

  // Quick facts: real numbers only.
  const facts = document.createElement('dl');
  facts.className = 'hero__facts';
  site.quickFacts.forEach((fact) => {
    const group = document.createElement('div');
    group.className = 'hero__fact';

    const value = document.createElement('dt');
    value.className = `hero__fact-value${fact.mono ? ' mono' : ''}`;
    value.textContent = fact.value;

    const label = document.createElement('dd');
    label.className = 'hero__fact-label';
    label.textContent = fact.label;

    group.append(value, label);
    facts.appendChild(group);
  });

  const status = document.createElement('div');
  status.className = 'hero__status';
  status.appendChild(availabilityBadge());

  const cue = document.createElement('a');
  cue.className = 'hero__cue';
  cue.href = '#provide';
  cue.setAttribute('aria-label', 'Scroll to what I provide');
  cue.innerHTML = `
    <svg viewBox="0 0 24 32" width="20" height="26" aria-hidden="true" focusable="false">
      <path d="M12 2v24M4 19l8 8 8-8" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  shell.append(wordmark, heading, tagline, facts, status);
  section.append(shell, cue);
  return section;
}

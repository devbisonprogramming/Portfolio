import { availability } from '../data/site.js';

/**
 * The commissions badge. One component, used in the hero and again in contact,
 * both reading `site.availability.open` - so the status can never disagree
 * with itself.
 */
export function availabilityBadge() {
  const { open, label } = availability();
  const el = document.createElement('span');
  el.className = `badge${open ? ' badge--open' : ''}`;

  const dot = document.createElement('span');
  dot.className = 'badge__dot';
  dot.setAttribute('aria-hidden', 'true');

  el.append(dot, document.createTextNode(label));
  return el;
}

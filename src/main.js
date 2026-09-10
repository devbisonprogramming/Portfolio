import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import './styles/wheel.css';
import './styles/modal.css';
import './styles/chrome.css';

import { heroSection } from './sections/hero.js';
import { provideSection } from './sections/provide.js';
import { wheelSection } from './sections/wheel-section.js';
import { gamesSection } from './sections/games.js';
import { pricingSection } from './sections/pricing.js';
import { aboutSection } from './sections/about.js';
import { contactSection, footer } from './sections/contact.js';
import { mountStarfield } from './lib/starfield.js';
import { mountScrollRail } from './lib/scroll-rail.js';

/**
 * Scroll order is deliberate: a stranger needs to know who they are looking at
 * before being handed an interactive tool, so the wheel comes third rather
 * than opening the page.
 */
const app = document.getElementById('app');

app.append(
  heroSection(),
  provideSection(),
  wheelSection(),
  gamesSection(),
  pricingSection(),
  aboutSection(),
  contactSection(),
  footer()
);

// Page chrome, mounted outside #app: the ambient pixel field sits behind
// everything, and the scroll rail stands in for the hidden native scrollbar.
mountStarfield(document.body);
mountScrollRail(document.body);

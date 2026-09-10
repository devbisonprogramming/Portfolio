/**
 * ============================================================================
 * ARC PRESENTATION - how each category is drawn and described.
 * ============================================================================
 *
 * The wheel's arcs come from the distinct `category` values in projects.js.
 * This file only supplies their PRESENTATION: display order, accent colour,
 * node icon family, and the prose shown in the hub when the arc is active.
 *
 * Adding a project to an existing category needs nothing here.
 * Adding a brand-new category needs one entry here - and if you forget, the
 * arc still renders using DEFAULT_CATEGORY below, just without a description.
 *
 * `accent` values walk the palette from the cool indigo (#4C6FFF) to the glow
 * purple (#A855F7) so the five arcs read as one family rather than five hues.
 * Keep any new entry inside that range.
 *
 * `icon` selects a procedurally drawn node glyph from src/wheel/textures.js.
 * Valid keys: 'packet' | 'store' | 'play' | 'panel' | 'spark'
 */

export const DEFAULT_CATEGORY = {
  accent: '#7C63FF',
  icon: 'spark',
  blurb: '',
};

export const categories = [
  {
    name: 'Networking & Security',
    accent: '#4C6FFF',
    icon: 'packet',
    blurb:
      "I don't trust the client. Every remote is validated and rate-limited server-side before it touches game state - if it can be faked, assume someone will try.",
  },
  {
    name: 'Data & Persistence',
    accent: '#6465FF',
    icon: 'store',
    blurb:
      "These systems are built around locking against concurrent writes and not falling over between sessions to prevent losing a player to dataloss.",
  },
  {
    name: 'Gameplay Systems',
    accent: '#7C5CFB',
    icon: 'play',
    blurb:
      'The classic game systems - movement, abilities, events. Server-authoritative, config-driven, built so other devs can refine it without opening the code.',
  },
  {
    name: 'UI/UX',
    accent: '#9257F9',
    icon: 'panel',
    blurb:
      "I build interfaces as systems, not static screens - states automatically update UI from whatever systems they are linked to.",
  },
  {
    name: 'Other Skills',
    accent: '#A855F7',
    icon: 'spark',
    blurb:
      "Not everything here is a full system. This is VFX, modelling, and animation work I've done alongside the programming.",
  },
];

/** Presentation for a category name, falling back to defaults if unlisted. */
export function categoryStyle(name) {
  return categories.find((c) => c.name === name) || { ...DEFAULT_CATEGORY, name };
}

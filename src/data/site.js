/**
 * ============================================================================
 * SITE CONTENT - the copy and status that changes without touching code.
 * ============================================================================
 */

export const site = {
  wordmark: 'DevBison',
  role: 'Programmer and Developer',
  tagline:
    'Combining imagination with professional quality to create scalable, maintainable and creative systems.',

  /**
   * AVAILABILITY - flip `open` between true and false. That is the only change
   * needed; the badge in the hero and the badge in the contact section both
   * read from here, and the label and colour follow automatically.
   */
  availability: {
    open: true,
    openLabel: 'Open for Commissions',
    closedLabel: 'Closed for Commissions',
  },

  /**
   * QUICK FACTS - real numbers only. Do not add client counts, revenue, or
   * anything that cannot be pointed at.
   */
  quickFacts: [
    { value: '3 yrs', label: 'developing on Roblox' },
    { value: '5 yrs', label: 'programming overall' },
    { value: '2,000', label: 'minimum project, in Robux', mono: true },
  ],

  provides: [
    'Clean, scalable gameplay systems',
    'Secure client-server development',
    'Both front and backend systems depending on the need',
    'Stable, performance-focused and expandable code',
    'Well-documented, maintainable guarantee',
  ],

  /**
   * 3D modelling and environment building is real work, but it is not
   * scripting - it sits beside the wheel rather than inside one of the arcs.
   */
  supplementary: {
    title: 'Note: this is a selection to best reflect the work I have completed',
    body: 'There are many more systems within games themselves, so if a system you wish for isnt here does not mean that I cannot make it. Just ask :)',
  },

  about: [
    'Around three years developing on Roblox specifically, and four to five years programming overall.',
    'I prioritise clean, maintainable and performant code to ensure that my clients are always satisfied and dont run into issues down the line.',
  ],

  /**
   * AI POLICY - the short note in the footer. Kept deliberately plain: it is a
   * disclosure, not a selling point.
   */
  aiPolicy: {
    label: 'AI policy',
    body: 'Since many people worry about the use of AI, I can guarantee that my systems are designed and programmed by myself. AI is used solely as a development tool to streamline tasks such as debugging and finding optimisations to deliver the best results to clients as possible.',
  },

  contact: {
    /**
     * Set this to null to render the contact button inert ("Discord link
     * coming soon") rather than pointing at nothing.
     */
    discordUrl: 'https://discord.com/users/674329973540126734',
    discordLabel: 'Discord',
    discordHandle: null, // optional: e.g. 'devbison' shown as plain text
    body: 'Discord is the fastest way to reach me. Send a short description of the system you need and a rough scope, and I will come back with a timescale and a price if available.',
  },

  games: [
    {
      id: 'brainrot-dungeon',
      title: 'Brainrot Dungeon',
      role: 'Lead developer and programmer, working alongside other developers',
      description:
        'Players descend into a dungeon collecting brainrots while avoiding patrolling monsters. The rarer brainrots are found further down.',
      visits: '50,000 visits',
      visitsNote:
        'The game was pulled before the Roblox algorithm picked it up.',
      url: 'https://www.roblox.com/games/81264486106059/Brainrot-Dungeon',
      image: 'games/brainrot-dungeon.webp',
    },
  ],
};

/** Current availability, resolved to a label and a state string. */
export function availability() {
  const { open, openLabel, closedLabel } = site.availability;
  return { open, label: open ? openLabel : closedLabel };
}

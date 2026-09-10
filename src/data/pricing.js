/**
 * ============================================================================
 * PRICING - all figures in ROBUX.
 * ============================================================================
 * Never render these with a dollar sign or any real-world currency symbol.
 * The Robux mark is applied by the pricing section; `price` holds the number
 * range only.
 */

export const pricing = {
  tiers: [
    {
      id: 'small',
      name: 'Small Systems',
      time: '2-5 hours',
      price: '2,000 - 10,000',
      includes: [
        'Single-purpose systems and straightforward services',
        'Quick turnaround',
        'Clean, readable, maintainable code',
      ],
      bestFor: 'Isolated features',
    },
    {
      id: 'medium',
      name: 'Medium Systems',
      time: '2-7 days',
      price: '10,000 - 50,000',
      includes: [
        'Multi-part implementations and more in-depth systems',
        'Integration into an existing codebase',
        'Configurable, reusable design',
        'Revisions and testing included',
        'Bug support',
      ],
      bestFor: 'The majority of work',
      emphasis: true,
    },
    {
      id: 'large',
      name: 'Large Systems',
      time: '1-3+ weeks',
      price: '50,000+',
      includes: [
        'Complete multi-system projects',
        'Robust error handling and scalability considerations',
        'Full documentation',
        'Bug-support guarantee',
      ],
      bestFor: 'Complex or sizeable tasks',
    },
  ],

  /** Reproduced exactly as written. Do not paraphrase. */
  footnote:
    'All prices are subject to the project, timescale and availability. Prices and examples shown here should be viewed as guidelines. Complexity vs scope may vary.',
};

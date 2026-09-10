/**
 * ============================================================================
 * THE PROJECT LIST
 * ============================================================================
 *
 * HOW TO ADD A NEW SYSTEM (this is the whole procedure):
 *
 *   1. Append one object to the array below.
 *   2. Drop one image at  public/assets/images/projects/<that object's id>.png
 *
 * That is it. No rendering code changes, ever.
 *
 * The wheel builds itself from this array:
 *   - Its arcs are the DISTINCT `category` values found here, ordered by
 *     src/data/categories.js.
 *   - The nodes on each arc are the projects filtered to that category.
 *   - The mobile accordion (< 768px) reads the exact same array.
 *
 * If step 2 is skipped, nothing breaks: src/components/media.js draws a flat
 * #16111F panel with the project title in mono as an automatic stand-in. Drop
 * the real screenshot in later and it takes over with no code change.
 *
 * ---------------------------------------------------------------------------
 * FIELDS
 *   id          string   kebab-case. Doubles as the image filename. Unique.
 *   title       string   Display name.
 *   category    string   Match a `name` in categories.js to get styled.
 *   description string   One or two sentences. Shown in modal and accordion.
 *   features    string[] Bullet points. Concrete and technical.
 *   githubUrl   string?  Optional. Omit the field entirely if there is no repo.
 *   mediaType   string   'image'   -> one screenshot at projects/<id>.png
 *                        'gallery' -> several images in projects/<id>/
 *   gallery     string[] Only for mediaType 'gallery'. Filenames WITHOUT the
 *                        extension, inside projects/<id>/. Any that are missing
 *                        render as labelled placeholder tiles.
 *   flagship    boolean? Optional. Marks the headline piece.
 *   note        string?  Optional. Honest context under the title, e.g.
 *                        "personal project, not a paid commission".
 * ---------------------------------------------------------------------------
 */

export const projects = [
  // -------------------------------------------------- 1. Networking & Security
  {
    id: 'networking-system',
    title: 'Networking System',
    category: 'Networking & Security',
    description:
      'A fast, optimised networking module inspired by Suphis "Packet" library and QuickNet',
    features: [
      'Event batching - prevents spam to the server',
      'Automatic data compression via buffers',
      'All events defined in a centralised module',
      'Compatible with RemoteFunctions',
      'Extends cleanly in large projects without adding clutter',
    ],
    githubUrl: 'https://github.com/devbisonprogramming/Network',
    mediaType: 'image',
  },
  {
    id: 'keel-framework',
    title: 'Keel Framework',
    note: 'The framework I use for my projects',
    category: 'Networking & Security',
    description:
      'A reusable framework to be dropped into new projects which allows for full setup in seconds.',
    features: [
      'Automatic system detection and registry',
      'Secure gamepass and developer-product purchase handling',
      'Easily configurable data systems for whatever any game needs to save',
      'Many inbuilt systems that can be ported when required such as a SoundSystem, InputManager, or a custom Cmdr wrapper',
    ],
    mediaType: 'image',
  },

  // -------------------------------------------------- 2. Data & Persistence
  {
    id: 'auction-system',
    title: 'Auction System',
    category: 'Data & Persistence',
    description:
      'A cross-server marketplace built to practice data safety.',
    features: [
      'MemoryStore listings with TTL expiry',
      'Compare-and-swap locking so concurrent bids on one listing cannot race',
      'Allows users to bid on items across servers and list their own',
    ],
    mediaType: 'image',
    note: 'Personal architecture and learning project, not a paid commission',
  },
  {
    id: 'giveaway-system',
    title: 'Giveaway System',
    category: 'Data & Persistence',
    description:
      'A system created to host, join and manage cross-server giveaways that users can join.',
    features: [
      'View active giveaways and join VIA a giveaway code',
      'Host giveaways and roll winners',
      'All handled with MemoryStores and Datastores to provide the quickest performance',
    ],
    mediaType: 'image',
  },

  // -------------------------------------------------- 3. Gameplay Systems
  {
    id: 'movement-system',
    title: 'Movement System',
    category: 'Gameplay Systems',
    description:
      'Custom movement system designed on a users request.',
    features: [
      'Stamina that drains based on movement intensity',
      'Hurdle and vault mechanic for clearing obstacles',
      'Sprint that accelerates realistically instead of snapping to top speed',
    ],
    mediaType: 'image',
    note: 'This project would have looked better if I had received the proper animations but the animator disappeared',
  },
  {
    id: 'event-system',
    title: 'Global Event System',
    category: 'Gameplay Systems',
    description:
      'Server-authoritative events that fire simultaneously across every server in an experience, with each server updating to match.',
    features: [
      'Per-experience configurable event boosts',
      'Global timer synced across all servers simultaneously',
      'Skybox and lighting customisation per event',
      'Terrain modification support',
    ],
    mediaType: 'image',
  },
  {
    id: 'ability-system',
    title: 'Ability System',
    category: 'Gameplay Systems',
    description: 'A customisable system for abilities and movesets.',
    features: [
      'Configurable abilities and movesets',
      'Cooldowns and anti-spam measures in place',
      'Designed to be flexible',
    ],
    mediaType: 'image',
    note: 'Never tested how good this is with better assets since it was only tested with my own poor-quality VFX and animation',
  },
  {
    id: 'complex-spawning',
    title: 'Complex Spawnable System',
    category: 'Gameplay Systems',
    description:
      'A complex brainrot system for a game that required in-depth RNG spawn mechanics and variable behaviours.',
    features: [
      'Carrying, dropping, selling and gifting mechanics',
      'Full shop and UI frontend',
      'Configurable weighted-RNG spawn tiers and rates',
      'Secure backend to prevent duplication exploits',
    ],
    mediaType: 'image',
  },
  {
    id: 'ghost-step-ability',
    title: 'Ghost-Step Ability',
    category: 'Gameplay Systems',
    description:
      'An optimised dash ability with camera + lighting effects, a ghostly trail effect, and the ability to aim.',
    features: [
      'Object-pooled ghost snapshot effect to maximise performance',
      'Reliable raycasting to aim wherever desired (within range)',
      'Camera effects such as movement pulse and flash',
    ],
    githubUrl: 'https://github.com/devbisonprogramming/Ghost-Step/blob/main/GhostStep.lua',
    mediaType: 'image',
  },

  // -------------------------------------------------- 4. UI/UX
  {
    id: 'inventory-item-system',
    title: 'Inventory + Item System',
    category: 'UI/UX',
    description:
      'A modular inventory and item system designed to be dropped into a project and grown with it, rather than added to and falling apart.',
    features: [
      'Custom item types',
      'Multiple pickup modes - server-authoritative, client-side, and respawning',
      'Sort modes: None, Name, Quantity, Rarity, Type',
      'Hotbar for equipping and using items',
      'Clean linkage into other systems such as combat',
      'All customisable through config files',
    ],
    githubUrl: 'https://github.com/devbisonprogramming/Inventory-System',
    mediaType: 'image',
  },
  {
    id: 'ui-design',
    title: 'UI Design',
    category: 'UI/UX',
    description:
      'I have programmed with most common types of menu out there that link into game functionality - just to name a few:',
    features: [
      'Performant menus that have to populate live, like indexes or inventories',
      'Interactive main menus for games involving background camera effects too',
      'Shop UIs made to catch the eye that link to secure MarketplaceService backends',
    ],
    mediaType: 'gallery',
    gallery: ['ui-1', 'ui-2'],
  },

  // -------------------------------------------------- 5. Other Skills
  {
    id: 'weapons-vfx-demo',
    title: 'Weapon + VFX Demo',
    category: 'Other Skills',
    description:
      'A visual demo built to be converted - the effects and feedback of a combat system, structured so the combat logic can be dropped in on top.',
    features: [
      'Camera shake on impact',
      'A range of unique weapon VFX - magical staffs, lightning, and others',
      'Structured to convert easily into a full combat system',
    ],
    mediaType: 'image',
    note: 'This was not made to be a full system - it was more me messing around with programming alongside VFX and animation',
  },
  {
    id: 'vfx',
    title: 'VFX',
    category: 'Other Skills',
    description:
      'I have experience with making VFX as well as just programming - this is some of the work I have done.',
    features: [
      'Ranged abilities like magical staffs',
      'Character "auras"',
      'Explosions',
    ],
    mediaType: 'gallery',
    gallery: ['vfx-1', 'vfx-2', 'vfx-3', 'vfx-4'],
  },
  {
    id: 'modelling',
    title: 'Modelling',
    category: 'Other Skills',
    description:
      'I have reasonable experience with modelling and building as well as programming. This covers a wide range of types of building too',
    features: [
      'Detailed 3D models such as swords and other weapons',
      'Rigged pet models I have used in personal games',
      'Cartoony/low-poly design buildings or terrain',
      'Creating maps and scenes within Studio',
    ],
    mediaType: 'gallery',
    gallery: ['model-1', 'model-2', 'model-3', 'model-4'],
  },
  {
    id: 'animation',
    title: 'Animation',
    category: 'Other Skills',
    description:
      'I have experience creating animations for use when scripting abilities, cutscenes, etc.',
    features: [
      'Ability animations that simulate weight and effort from the character',
      'Cutscene animations',
      'Animating rigs such as pet animations',
    ],
    mediaType: 'gallery',
    gallery: ['animation-1', 'animation-2', 'animation-3', 'animation-4'],
  },
];

/** Projects belonging to one category, in array order. */
export function projectsInCategory(category) {
  return projects.filter((p) => p.category === category);
}
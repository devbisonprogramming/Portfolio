# DevBison portfolio

Single-page portfolio for Roblox scripting and systems commissions. Vanilla JS
built with Vite; Three.js and GSAP are used only for the Skill Wheel.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the built output
```

`vite.config.js` sets `base: './'`, so `dist/` works from a domain root, a
subpath (GitHub Pages project sites), or opened off disk.

---

## Adding a new system

Two steps, no code changes:

1. Append one object to the array in `src/data/projects.js`.
2. Drop an image at `public/assets/images/projects/<that object's id>.png`.

The wheel derives its arcs from the distinct `category` values in that array
and its nodes from the projects in each category, so a new entry appears on the
dial and in the mobile accordion automatically. The field reference is
documented at the top of the file.

Adding a brand-new **category** costs one extra line: a matching entry in
`src/data/categories.js` giving the arc its accent colour, node icon, and the
description shown in the hub. Forget it and the arc still renders, just with
default styling.

## Images

Nothing needs to be pre-supplied. Any image that is missing is replaced at
runtime by a generated placeholder — a flat `#16111F` panel with the title
centred in the mono family (`src/components/media.js`). Drop the real
screenshot into the matching folder and it takes over with no code change.

```
public/assets/images/
  projects/<project-id>.png    one per project with mediaType 'image'
  projects/<project-id>/       gallery tiles for mediaType 'gallery'
  games/brainrot-dungeon.webp
```

For `mediaType: 'gallery'` projects, the `gallery` array lists filenames
(without extension) inside `projects/<id>/`. `hero/` and `misc/` are empty
leftovers from the original asset plan and are referenced by nothing — safe to
delete.

## Content you edit without touching components

| File | Holds |
|---|---|
| `src/data/projects.js` | Every project, its features, and its GitHub link |
| `src/data/categories.js` | Arc order, accent colour, node icon, arc description |
| `src/data/site.js` | Wordmark, tagline, quick facts, availability, about, Discord, shipped games |
| `src/data/pricing.js` | The three tiers and the footnote |

**Availability** is one boolean: `site.availability.open` in `src/data/site.js`.
Both badges (hero and contact) read from it, so they cannot disagree.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds the site and publishes `dist/` on every
push to `main`. `dist/` is gitignored on purpose — the workflow builds it, so
nothing built is ever committed.

One-time setup on the repository: **Settings → Pages → Build and deployment →
Source: GitHub Actions**. After that every push to `main` redeploys, and the
run's URL appears under the Actions tab.

`vite.config.js` sets `base: './'`, so the same build works whether the repo is
served from `<user>.github.io` or from `<user>.github.io/<repo>/` — no config
change is needed for a project site.

## How the wheel is put together

```
src/wheel/
  index.js       breakpoint router; dynamically imports the dial
  dial.js        desktop assembly and interaction state
  layout.js      projects -> arc angles and node positions
  scene.js       orthographic renderer, resize, render loop
  arcs.js        ring segments (fill / hairline edge / additive glow)
  nodes.js       project nodes and their rest / arc / hot states
  glow.js        ambient motes and hub bloom
  textures.js    procedurally drawn icons and falloff sprites
  interaction.js pointer raycasting
  keyboard.js    the DOM accessibility layer over the canvas
  hub.js         hub readout, description strip, floating node label
  accordion.js   the sub-768px form of the same data
```

Notes worth knowing before changing it:

- **Three.js is a lazy chunk.** `index.js` imports `dial.js` dynamically, so
  visitors below 768px download the accordion and never fetch the renderer
  (~477 kB of the build).
- **The canvas has no accessibility tree**, so the arcs also exist as real DOM
  buttons in `keyboard.js`, positioned over the stage with `pointer-events:
  none`. They stay tabbable without interfering with mouse raycasting. Tab
  moves between arcs, arrow keys between nodes, Enter opens, and a polite live
  region announces the node under the cursor.
- **The stage is locked to a square aspect ratio.** `keyboard.js` maps world
  units straight onto percentages, which only holds while that is true.
- **Reduced motion.** GSAP durations collapse to zero and the ambient drift is
  skipped; the render loop stays off and is woken for short windows by
  `scene.pulse()` when state changes, so hover and focus still repaint.

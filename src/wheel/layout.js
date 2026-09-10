import { categoryStyle } from '../data/categories.js';

/**
 * Turns the project list into wheel geometry.
 *
 * Everything here is derived - the number of arcs is however many distinct
 * categories exist, and the nodes on each arc are however many projects sit in
 * that category.
 *
 * Arc spans are NOT equal fifths. Every node on the ring gets the same angular
 * pitch, and an arc is then made exactly as wide as its own nodes need. A
 * category with five systems gets a wide arc, one with two gets a narrow one,
 * and node density is identical everywhere - which is what stops the busiest
 * category from reading as crowded while its neighbours read as empty.
 * Adding a project widens its arc and narrows the others; nothing else changes.
 */

export const GAP = 0.055; // radians of empty ring between arcs
export const R_INNER = 0.6;
export const R_OUTER = 0.84;
export const R_NODE = (R_INNER + R_OUTER) / 2;
export const NODE_RADIUS = 0.052;

/** Where the arc labels are anchored. They are then pushed outward from here
 *  by half their own box (see wheel/keyboard.js), so text never sits on the
 *  ring. The clearance also has to leave room for the floating node label,
 *  which sits in the band between the ring and the category name. */
export const R_LABEL = R_OUTER + 0.17;

const TAU = Math.PI * 2;
const TOP = Math.PI / 2;

// A node's own angular footprint on the ring, and the spacing built from it.
const NODE_ARC = (NODE_RADIUS * 2) / R_NODE;
const PITCH = NODE_ARC * 1.9; // centre-to-centre between neighbouring nodes
const PAD = NODE_ARC * 1.55; // clear ring at each end of an arc

/**
 * @param {Array} categories ordered category presentation objects
 * @param {Function} projectsInCategory (name) => project[]
 * @returns arc descriptors with angles and node positions
 */
export function buildLayout(categories, projectsInCategory) {
  const count = categories.length;
  if (count === 0) return [];

  const entries = categories.map((category) => {
    const items = projectsInCategory(category.name);
    // An empty category still gets a visible sliver rather than collapsing.
    const need = Math.max(items.length - 1, 0) * PITCH + PAD * 2;
    return { category, items, need };
  });

  // Scale the whole ring so the arcs plus their gaps close the circle exactly.
  const available = TAU - GAP * count;
  const required = entries.reduce((sum, entry) => sum + entry.need, 0);
  const scale = required > 0 ? available / required : 0;
  const pitch = PITCH * scale;
  const pad = PAD * scale;

  let cursor = TOP - GAP / 2;

  return entries.map(({ category, items, need }, index) => {
    // Arcs run clockwise from the top of the dial.
    const span = need * scale;
    const end = cursor;
    const start = end - span;
    const mid = start + span / 2;
    cursor = start - GAP;

    const style = categoryStyle(category.name);

    // Nodes sit at a constant pitch, centred inside their own arc.
    const first = start + pad;
    const nodes = items.map((project, i) => {
      const angle = items.length === 1 ? mid : first + pitch * i;
      return {
        project,
        angle,
        x: Math.cos(angle) * R_NODE,
        y: Math.sin(angle) * R_NODE,
      };
    });

    return {
      index,
      name: category.name,
      blurb: style.blurb,
      accent: style.accent,
      icon: style.icon,
      start,
      end,
      span,
      mid,
      labelX: Math.cos(mid) * R_LABEL,
      labelY: Math.sin(mid) * R_LABEL,
      // Unit vector pointing away from the hub, used to push the label clear.
      labelDirX: Math.cos(mid),
      labelDirY: Math.sin(mid),
      nodes,
    };
  });
}

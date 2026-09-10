import * as THREE from 'three';

/**
 * Pointer handling for the dial.
 *
 * Nodes are tested before arcs so a node sitting on an arc always wins the
 * hit, and the whole thing is one raycast per pointermove against a small,
 * explicit target list rather than the entire scene graph.
 */
export function createPointer({ renderer, camera, arcTargets, nodeTargets, onHover, onSelect }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const element = renderer.domElement;

  let last = { arcIndex: null, projectId: null };

  function pick(event) {
    const rect = element.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const nodeHit = raycaster.intersectObjects(nodeTargets, false)[0];
    if (nodeHit) {
      return {
        arcIndex: nodeHit.object.userData.arcIndex,
        projectId: nodeHit.object.userData.projectId,
      };
    }

    const arcHit = raycaster.intersectObjects(arcTargets, false)[0];
    if (arcHit) {
      return { arcIndex: arcHit.object.userData.arcIndex, projectId: null };
    }

    return { arcIndex: null, projectId: null };
  }

  function onPointerMove(event) {
    const hit = pick(event);
    if (hit.arcIndex === last.arcIndex && hit.projectId === last.projectId) return;
    last = hit;
    element.style.cursor = hit.projectId ? 'pointer' : 'default';
    onHover(hit);
  }

  function onPointerLeave() {
    if (last.arcIndex === null && last.projectId === null) return;
    last = { arcIndex: null, projectId: null };
    element.style.cursor = 'default';
    onHover(last);
  }

  function onClick(event) {
    const hit = pick(event);
    if (hit.projectId) onSelect(hit);
  }

  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerleave', onPointerLeave);
  element.addEventListener('click', onClick);

  return {
    destroy() {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('click', onClick);
    },
  };
}

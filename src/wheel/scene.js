import * as THREE from 'three';
import { prefersReducedMotion } from '../lib/motion.js';

/**
 * The wheel is a flat dial, so it uses an orthographic camera looking straight
 * down -Z. World units are chosen so the dial has radius 1.0; everything else
 * in the wheel is expressed as a fraction of that and stays resolution
 * independent.
 *
 * The render loop only runs while the wheel is actually on screen, and under
 * reduced motion it does not run at all - the scene is rendered on demand
 * instead, so state changes still show but nothing drifts.
 */

export const VIEW = 1.32; // half-height of the frustum: the dial plus room for its labels

export function createScene(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 10);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.classList.add('wheel__canvas');
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  let width = 0;
  let height = 0;
  let running = false;
  let visible = true;
  let frame = null;
  const updaters = new Set();
  const clock = new THREE.Clock();

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));

    const aspect = width / height;
    if (aspect >= 1) {
      camera.top = VIEW;
      camera.bottom = -VIEW;
      camera.left = -VIEW * aspect;
      camera.right = VIEW * aspect;
    } else {
      camera.left = -VIEW;
      camera.right = VIEW;
      camera.top = VIEW / aspect;
      camera.bottom = -VIEW / aspect;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  /**
   * Normally the loop runs continuously while the wheel is on screen, driving
   * the ambient drift. Under reduced motion there is no drift to draw, so the
   * loop stays off and is instead woken for a short window by `pulse()` -
   * otherwise a hover or focus change would tween its materials and never get
   * repainted.
   */
  let pulseUntil = 0;

  function loopWanted() {
    if (!visible || document.hidden) return false;
    if (!prefersReducedMotion()) return true;
    return performance.now() < pulseUntil;
  }

  function tick() {
    if (!running) return;
    if (!loopWanted()) {
      render();
      stop();
      return;
    }
    const delta = Math.min(clock.getDelta(), 0.05);
    updaters.forEach((fn) => fn(delta));
    render();
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    if (!loopWanted()) {
      render();
      return;
    }
    running = true;
    clock.getDelta();
    frame = requestAnimationFrame(tick);
  }

  /** Draw for a short window - used after a state change. */
  function pulse(ms = 620) {
    pulseUntil = Math.max(pulseUntil, performance.now() + ms);
    start();
  }

  function stop() {
    running = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  // Pause the loop whenever the wheel scrolls out of view or the tab is hidden.
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { rootMargin: '120px' }
  );
  observer.observe(container);

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  /**
   * Project a world position to CSS pixels within the container, for DOM
   * labels that need to sit on top of a rendered node.
   */
  function toScreen(vector) {
    const projected = vector.clone().project(camera);
    return {
      x: ((projected.x + 1) / 2) * width,
      y: ((1 - projected.y) / 2) * height,
    };
  }

  /** Register a per-frame callback. Returns an unregister function. */
  function onFrame(fn) {
    updaters.add(fn);
    return () => updaters.delete(fn);
  }

  function dispose() {
    stop();
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return { scene, camera, renderer, pulse, start, onFrame, toScreen, dispose };
}

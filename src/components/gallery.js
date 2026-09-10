import { image } from './media.js';

/**
 * A small gallery for projects with `mediaType: 'gallery'`.
 *
 * Each entry in `project.gallery` maps to
 *   public/assets/images/projects/<project.id>/<entry>.png
 * and any file that is not there yet renders as a labelled placeholder tile,
 * so the grid always looks intentional rather than half-loaded.
 */
export function gallery(project) {
  const items = project.gallery && project.gallery.length ? project.gallery : ['01'];

  const grid = document.createElement('div');
  grid.className = 'gallery';

  items.forEach((name, index) => {
    const tile = document.createElement('div');
    tile.className = 'gallery__tile';
    tile.appendChild(
      image({
        src: `projects/${project.id}/${name}.png`,
        label: `${project.title} ${index + 1}`,
        width: 480,
        height: 300,
        className: 'gallery__img',
        eager: true,
      })
    );
    grid.appendChild(tile);
  });

  return grid;
}

import { ORIENTATIONS } from './types.js';

export function aabbOverlap(a, b) {
  return !(
    a.x + a.l <= b.x ||
    b.x + b.l <= a.x ||
    a.z + b.w <= b.z ||
    b.z + b.w <= a.z ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

export function inBounds(box, container) {
  return (
    box.x >= 0 &&
    box.z >= 0 &&
    box.y >= 0 &&
    box.x + box.l <= container.l + 1e-6 &&
    box.z + box.w <= container.w + 1e-6 &&
    box.y + box.h <= container.h + 1e-6
  );
}

export function fitsAt(box, placed, container) {
  if (!inBounds(box, container)) return false;
  for (const other of placed) {
    if (aabbOverlap(box, other)) return false;
  }
  return true;
}

export function getOrientations(size) {
  const out = [];
  for (const perm of ORIENTATIONS) {
    out.push({
      l: size[perm[0]],
      w: size[perm[1]],
      h: size[perm[2]],
    });
  }
  return out;
}

export function volumeOf(box) {
  return box.l * box.w * box.h;
}

export function supports(box, floorY) {
  return Math.abs(box.y - floorY) < 1e-6;
}

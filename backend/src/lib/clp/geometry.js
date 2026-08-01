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
  if (!fullySupported(box, placed, container)) return false;
  return true;
}

export function fullySupported(box, placed, container) {
  if (box.y <= 1e-3) return true;
  const boxArea = box.l * box.w;
  if (boxArea <= 0) return false;
  const threshold = boxArea * 0.99;
  let supportedArea = 0;
  for (const other of placed) {
    if (Math.abs(other.y + other.h - box.y) > 1e-3) continue;
    const xOverlap =
      Math.min(box.x + box.l, other.x + other.l) -
      Math.max(box.x, other.x);
    const zOverlap =
      Math.min(box.z + box.w, other.z + other.w) -
      Math.max(box.z, other.z);
    if (xOverlap <= 0 || zOverlap <= 0) continue;
    supportedArea += xOverlap * zOverlap;
    if (supportedArea >= threshold) return true;
  }
  return false;
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

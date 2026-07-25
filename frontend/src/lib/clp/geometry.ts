/**
 * Pure AABB geometry helpers used by the packing algorithm.
 *
 * All coordinates are in millimeters. A box is described by its
 * half-extents (radii) and the world-space center of the box.
 * Rotations are restricted to multiples of 90° about Y, so the
 * axis-aligned bounding box is identical to the rotated box.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Size3 {
  l: number;
  w: number;
  h: number;
}

export interface Bounds {
  l: number;
  w: number;
  h: number;
}

export interface AABB {
  /** Min corner. */
  min: Vec3;
  /** Max corner. */
  max: Vec3;
}

/** Build an AABB from center + size. */
export function aabbFromCenter(center: Vec3, size: Size3): AABB {
  return {
    min: {
      x: center.x - size.l / 2,
      y: center.y - size.h / 2,
      z: center.z - size.w / 2,
    },
    max: {
      x: center.x + size.l / 2,
      y: center.y + size.h / 2,
      z: center.z + size.w / 2,
    },
  };
}

/** Build an AABB from a min corner and a size. */
export function aabbFromMin(min: Vec3, size: Size3): AABB {
  return {
    min,
    max: { x: min.x + size.l, y: min.y + size.h, z: min.z + size.w },
  };
}

/** True when two AABBs overlap on all three axes (interiors touching
 *  count as overlap, equal edges do not). */
export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.min.x < b.max.x &&
    a.max.x > b.min.x &&
    a.min.y < b.max.y &&
    a.max.y > b.min.y &&
    a.min.z < b.max.z &&
    a.max.z > b.min.z
  );
}

/** True if `inner` is fully contained inside `outer`. */
export function aabbContains(outer: AABB, inner: AABB): boolean {
  return (
    inner.min.x >= outer.min.x &&
    inner.max.x <= outer.max.x &&
    inner.min.y >= outer.min.y &&
    inner.max.y <= outer.max.y &&
    inner.min.z >= outer.min.z &&
    inner.max.z <= outer.max.z
  );
}

/** Footprint intersection area on the X/Z plane (mm²). Returns 0 if
 *  boxes do not touch in the X/Z plane. */
export function footprintOverlapArea(a: AABB, b: AABB): number {
  const dx = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const dz = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (dx <= 0 || dz <= 0) return 0;
  return dx * dz;
}

/** Footprint area of an AABB (mm²). */
export function footprintArea(box: AABB): number {
  return (box.max.x - box.min.x) * (box.max.z - box.min.z);
}

/** Floor-area footprint of a size. */
export function sizeFootprintArea(size: Size3): number {
  return size.l * size.w;
}

/** Volume in mm³. */
export function volume(size: Size3): number {
  return size.l * size.w * size.h;
}

/**
 * Collision detection — AABB-vs-AABB using the spatial hash.
 *
 * `PlacementGrid` owns the spatial hash and a parallel array of
 * `placed` boxes (keyed by AABB). It exposes:
 *   - `add(box)`      — insert a new box
 *   - `hasOverlap(b)` — first overlapping box or undefined
 *   - `supportArea(b, minRatio)` — X/Z footprint area of b
 *     that is supported by an existing box whose top sits at
 *     `b.min.y` (within 1mm tolerance).
 */

import type { AABB, Size3, Vec3 } from "./geometry";
import { aabbFromMin, footprintOverlapArea } from "./geometry";
import { SpatialHash } from "./spatialHash";

export class PlacementGrid {
  private readonly hash: SpatialHash;
  private readonly boxes: AABB[] = [];

  constructor(cellSize: number) {
    this.hash = new SpatialHash(cellSize);
  }

  /** Add a box to the grid. */
  add(min: Vec3, size: Size3): void {
    const aabb = aabbFromMin(min, size);
    this.boxes.push(aabb);
    this.hash.insert(aabb);
  }

  /** AABB of the i-th placed box. */
  get(i: number): AABB {
    return this.boxes[i];
  }

  count(): number {
    return this.boxes.length;
  }

  /** First box that overlaps the query, or undefined. */
  hasOverlap(min: Vec3, size: Size3): AABB | undefined {
    return this.hash.queryOverlap(aabbFromMin(min, size));
  }

  /**
   * X/Z footprint area that is supported by an existing box whose
   * top is at `boxMinY` (within tolerance).
   *
   * The container floor is treated as full support.
   */
  supportArea(boxMin: Vec3, size: Size3, tolerance = 1): number {
    if (boxMin.y <= tolerance) {
      // On the floor — full support.
      return size.l * size.w;
    }
    const myFootprint = size.l * size.w;
    const targetTop = boxMin.y;
    const myAabb: AABB = {
      min: { x: boxMin.x, y: boxMin.y, z: boxMin.z },
      max: { x: boxMin.x + size.l, y: boxMin.y + size.h, z: boxMin.z + size.w },
    };
    const query: AABB = {
      min: { x: boxMin.x, y: boxMin.y - tolerance, z: boxMin.z },
      max: { x: boxMin.x + size.l, y: boxMin.y, z: boxMin.z + size.w },
    };
    let supported = 0;
    for (const other of this.hash.iterateOverlap(query)) {
      if (Math.abs(other.max.y - targetTop) > tolerance) continue;
      supported += footprintOverlapArea(other, myAabb);
      if (supported >= myFootprint) return myFootprint;
    }
    return supported;
  }

  /** Iterate every placed box. */
  *all(): IterableIterator<AABB> {
    for (const b of this.boxes) yield b;
  }
}

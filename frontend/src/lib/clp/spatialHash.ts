/**
 * Uniform 3D Spatial Hash Grid.
 *
 * Cell size is a multiple of the largest box dimension the
 * caller plans to insert. Boxes are stored by their AABB min
 * cell index and can be queried by AABB intersection.
 *
 * Used by the packing algorithm to short-circuit brute-force
 * AABB-vs-AABB collision checks: only neighbors of the query
 * box are tested.
 */

import type { AABB } from "./geometry";
import { aabbOverlap } from "./geometry";

export class SpatialHash {
  private readonly cellSize: number;
  private readonly cells: Map<string, number[]> = new Map();
  private readonly boxes: AABB[] = [];

  constructor(cellSize: number) {
    this.cellSize = Math.max(1, cellSize);
  }

  /** Quantize a coordinate to a cell index. */
  private key(x: number, y: number, z: number): string {
    const cs = this.cellSize;
    const ix = Math.floor(x / cs);
    const iy = Math.floor(y / cs);
    const iz = Math.floor(z / cs);
    return `${ix},${iy},${iz}`;
  }

  /** Insert a box and return its handle (index in the boxes array). */
  insert(box: AABB): number {
    const handle = this.boxes.length;
    this.boxes.push(box);
    for (const k of this.cellsFor(box)) {
      let bucket = this.cells.get(k);
      if (!bucket) {
        bucket = [];
        this.cells.set(k, bucket);
      }
      bucket.push(handle);
    }
    return handle;
  }

  /** Iterate all cells the given AABB touches. */
  private *cellsFor(box: AABB): Iterable<string> {
    const cs = this.cellSize;
    const ix0 = Math.floor(box.min.x / cs);
    const iy0 = Math.floor(box.min.y / cs);
    const iz0 = Math.floor(box.min.z / cs);
    const ix1 = Math.floor(box.max.x / cs);
    const iy1 = Math.floor(box.max.y / cs);
    const iz1 = Math.floor(box.max.z / cs);
    for (let ix = ix0; ix <= ix1; ix++) {
      for (let iy = iy0; iy <= iy1; iy++) {
        for (let iz = iz0; iz <= iz1; iz++) {
          yield `${ix},${iy},${iz}`;
        }
      }
    }
  }

  /** Return the first box in the hash that overlaps the query,
   *  or undefined if none. */
  queryOverlap(query: AABB): AABB | undefined {
    const seen = new Set<number>();
    for (const k of this.cellsFor(query)) {
      const bucket = this.cells.get(k);
      if (!bucket) continue;
      for (const handle of bucket) {
        if (seen.has(handle)) continue;
        seen.add(handle);
        const other = this.boxes[handle];
        if (other && aabbOverlap(other, query)) return other;
      }
    }
    return undefined;
  }

  /** Iterate every box that overlaps the query (deduped). */
  *iterateOverlap(query: AABB): IterableIterator<AABB> {
    const seen = new Set<number>();
    for (const k of this.cellsFor(query)) {
      const bucket = this.cells.get(k);
      if (!bucket) continue;
      for (const handle of bucket) {
        if (seen.has(handle)) continue;
        seen.add(handle);
        const other = this.boxes[handle];
        if (other && aabbOverlap(other, query)) yield other;
      }
    }
  }

  /** Iterate every box in the hash. */
  *all(): IterableIterator<AABB> {
    for (const b of this.boxes) yield b;
  }

  get size(): number {
    return this.boxes.length;
  }

  clear(): void {
    this.cells.clear();
    this.boxes.length = 0;
  }
}

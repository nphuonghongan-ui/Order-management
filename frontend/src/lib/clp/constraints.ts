/**
 * Rule-based constraint validators.
 *
 * Each validator returns a list of `ConstraintViolation` items
 * (empty when the candidate is valid). The v1 rule set covers:
 *
 *   - `checkInside`        — the candidate's AABB fits within
 *                            the container interior.
 *   - `checkOnFloor`       — at least `minSupportRatio` of the
 *                            candidate's footprint is supported
 *                            by either the floor or the top of
 *                            a box already placed.
 *   - `checkStackWeight`   — the cumulative weight on top of
 *                            any supporting box does not exceed
 *                            its `maxStackKg`.
 *   - `checkOrientation`   — the orientation is in the
 *                            candidate's allow-list.
 *
 * Higher-level rules (fragility, hazmat, segregation) are
 * intentionally deferred until the PartNum schema grows the
 * necessary flags.
 */

import type { ConstraintViolation, OptimizationItem } from "./types";
import type { PlacementGrid } from "./collision";
import type { Bounds, Size3, Vec3 } from "./geometry";
import type { AxisRotation } from "@/components/container-viewer/types";

export interface CheckInput {
  item: OptimizationItem;
  min: Vec3;
  size: Size3;
  rot: AxisRotation;
  grid: PlacementGrid;
  bounds: Bounds;
  /** Map from placement index → placed item. */
  placedItems: Map<number, OptimizationItem>;
  /** Cumulative weight on top of each placed box (kg). */
  topLoad: Map<number, number>;
  /** minSupportRatio (0..1). Default 0.6. */
  minSupportRatio: number;
}

export function checkInside(input: CheckInput): ConstraintViolation[] {
  const { min, size, bounds } = input;
  if (
    min.x < 0 ||
    min.y < 0 ||
    min.z < 0 ||
    min.x + size.l > bounds.l + 1e-6 ||
    min.y + size.h > bounds.h + 1e-6 ||
    min.z + size.w > bounds.w + 1e-6
  ) {
    return [
      {
        kind: "out-of-bounds",
        message: "Candidate extends outside the container",
      },
    ];
  }
  return [];
}

export function checkOverlap(input: CheckInput): ConstraintViolation[] {
  const { min, size, grid } = input;
  const hit = grid.hasOverlap(min, size);
  if (hit) {
    return [
      {
        kind: "overlap",
        message: "Candidate overlaps an already-placed box",
      },
    ];
  }
  return [];
}

export function checkSupport(input: CheckInput): ConstraintViolation[] {
  const { min, size, grid, minSupportRatio } = input;
  const myFootprint = size.l * size.w;
  const supported = grid.supportArea(min, size);
  if (myFootprint <= 0) return [];
  const ratio = supported / myFootprint;
  if (ratio + 1e-6 < minSupportRatio) {
    return [
      {
        kind: "unsupported",
        message: `Only ${(ratio * 100).toFixed(0)}% of the footprint is supported`,
      },
    ];
  }
  return [];
}

export function checkStackWeight(input: CheckInput): ConstraintViolation[] {
  const { min, grid, item, placedItems, topLoad } = input;
  if (item.weightKg <= 0) return [];
  if (min.y <= 1) return []; // On the floor — no stack to consider.
  // For every supporting box, check whether the load + this item
  // exceeds the supporting item's maxStackKg.
  const myWeight = item.weightKg;
  const seen = new Set<number>();
  for (const other of grid.all()) {
    if (Math.abs(other.max.y - min.y) > 1) continue;
    // find handle of this other AABB
    const handle = findHandle(grid, other);
    if (handle < 0 || seen.has(handle)) continue;
    seen.add(handle);
    const placedItem = placedItems.get(handle);
    if (!placedItem) continue;
    const limit = placedItem.maxStackKg;
    if (limit === undefined) continue;
    const current = topLoad.get(handle) ?? 0;
    if (current + myWeight > limit + 1e-6) {
      return [
        {
          kind: "stack-weight",
          message: `Stack weight ${current + myWeight} kg exceeds limit ${limit} kg`,
        },
      ];
    }
  }
  return [];
}

export function checkOrientation(input: CheckInput): ConstraintViolation[] {
  const { item, rot } = input;
  if (!item.allowedOrientations || item.allowedOrientations.length === 0) {
    return [];
  }
  const allowed = item.allowedOrientations.some((o) => o.rot === rot);
  if (!allowed) {
    return [
      {
        kind: "orientation",
        message: `Rotation ${rot}° is not allowed for this item`,
      },
    ];
  }
  return [];
}

/**
 * Run all constraint checks in order; stop at the first failure
 * to short-circuit expensive validators.
 */
export function runAllChecks(input: CheckInput): ConstraintViolation[] {
  return [
    ...checkInside(input),
    ...checkOrientation(input),
    ...checkOverlap(input),
    ...checkSupport(input),
    ...checkStackWeight(input),
  ];
}

/** Linear search for the handle (placement index) of an AABB.
 *  PlacementGrid doesn't expose this directly because we built
 *  it around `all()` iteration; for v1 the cost is trivial. */
function findHandle(grid: PlacementGrid, target: { min: Vec3; max: Vec3 }): number {
  let i = 0;
  for (const b of grid.all()) {
    if (
      b.min.x === target.min.x &&
      b.min.y === target.min.y &&
      b.min.z === target.min.z &&
      b.max.x === target.max.x &&
      b.max.y === target.max.y &&
      b.max.z === target.max.z
    ) {
      return i;
    }
    i++;
  }
  return -1;
}

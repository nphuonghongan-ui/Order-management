/**
 * Greedy packing algorithm.
 *
 * Strategy: Largest-Volume-First (LVF) ordering + Extreme Points
 * (EP) enumeration + Best-Fit scoring.
 *
 *   1. Sort items by descending volume.
 *   2. Maintain an EP set starting at the container's floor corner.
 *   3. For each item:
 *      a. Enumerate (orientation × extreme point) candidates.
 *      b. Filter out candidates failing constraint checks.
 *      c. Pick the candidate with the highest best-fit score.
 *      d. Place the box, update the EP set + spatial hash.
 *
 * Items that fail to place are returned in `unplaced`. Quantities
 * > 1 are placed as a stack directly above the first unit.
 *
 * Container bounds are looked up from a `typeMap` passed by the
 * caller, instead of from a UI store. This lets the algorithm run
 * inside a Web Worker that has its own module instance.
 */

import type {
  ContainerType,
  ContainerTypeId,
} from "@/components/container-viewer/units";
import { PlacementGrid } from "./collision";
import {
  addAfterPlacement,
  createEPSet,
  type Bounds,
} from "./extremePoints";
import { filterOrientations, generateOrientations } from "./orientations";
import {
  bestFitScore,
  WEIGHTS_CORNER_FIRST,
  WEIGHTS_TIGHT,
  weightsForStrategy,
  type ScoreWeights,
} from "./scoring";
import { runAllChecks } from "./constraints";
import type {
  LoadingStrategy,
  OptimizationItem,
  Orientation,
  Placement,
} from "./types";

type TypeMap = Map<ContainerTypeId, ContainerType>;

export interface GreedyResult {
  placements: Placement[];
  unplaced: OptimizationItem[];
}

export interface GreedyOptions {
  minSupportRatio?: number;
  onProgress?: (placed: number, total: number) => void;
  isCancelled?: () => boolean;
  /** Placement strategy. Default `"tight"`. */
  loadingStrategy?: LoadingStrategy;
  /** Optional explicit weights override; if omitted, derived from
   *  `loadingStrategy`. */
  weights?: ScoreWeights;
}

interface StackedUnit {
  item: OptimizationItem;
  orient: Orientation;
  min: { x: number; y: number; z: number };
  /** Handle (placement index) into PlacementGrid. */
  handle: number;
  /** Supporters' handles (boxes this unit sits on top of). */
  supporterHandles: number[];
}

export interface PackingState {
  bounds: Bounds;
  grid: PlacementGrid;
  epSet: ReturnType<typeof createEPSet>;
  units: StackedUnit[];
  /** kg of weight loaded on top of each unit (handle → kg). */
  topLoad: Map<number, number>;
  /** Cached placedItems map (handle → item). */
  placedItems: Map<number, OptimizationItem>;
  minSupportRatio: number;
}

export function createPackingState(
  bounds: Bounds,
  itemsForCellSize: OptimizationItem[],
  minSupportRatio: number
): PackingState {
  const cellSize = Math.max(
    1,
    Math.max(
      ...itemsForCellSize.map((i) => Math.max(i.dims.l, i.dims.w, i.dims.h))
    )
  );
  return {
    bounds,
    grid: new PlacementGrid(cellSize),
    epSet: createEPSet(),
    units: [],
    topLoad: new Map(),
    placedItems: new Map(),
    minSupportRatio,
  };
}

/** Try to place a single unit of `item` at `min` with the given
 *  orientation. If successful, mutates the state and returns true. */
function tryPlaceUnit(
  state: PackingState,
  item: OptimizationItem,
  min: { x: number; y: number; z: number },
  orient: Orientation
): boolean {
  const size = { l: orient.l, w: orient.w, h: orient.h };
  const v = runAllChecks({
    item,
    min,
    size,
    rot: orient.rot,
    grid: state.grid,
    bounds: state.bounds,
    placedItems: state.placedItems,
    topLoad: state.topLoad,
    minSupportRatio: state.minSupportRatio,
  });
  if (v.length > 0) return false;

  // Compute supporters: every existing unit whose top is at `min.y`.
  const supporters: number[] = [];
  let i = 0;
  for (const other of state.grid.all()) {
    if (Math.abs(other.max.y - min.y) <= 1) {
      supporters.push(i);
    }
    i++;
  }

  const handle = state.grid.count();
  state.grid.add(min, size);
  state.placedItems.set(handle, item);
  state.units.push({ item, orient, min, handle, supporterHandles: supporters });

  // Update topLoad: every supporter gets +item.weightKg on top.
  if (item.weightKg > 0) {
    for (const s of supporters) {
      state.topLoad.set(s, (state.topLoad.get(s) ?? 0) + item.weightKg);
    }
  }

  addAfterPlacement(state.epSet, min, size, state.bounds);
  return true;
}

/** Best (orientation × EP) candidate for a single unit, or null. */
function findBestCandidate(
  state: PackingState,
  item: OptimizationItem,
  weights: ScoreWeights
): { min: { x: number; y: number; z: number }; orient: Orientation } | null {
  const orientations: Orientation[] = filterOrientations(
    generateOrientations(item.dims.l, item.dims.w, item.dims.h),
    item.allowedOrientations?.map((o) => o.rot)
  );
  const isCornerFirst = weights === WEIGHTS_CORNER_FIRST;
  // For corner-first, iterate EPs in increasing (x + z + y) order
  // so the first feasible candidate at the back-left-floor anchor
  // is naturally preferred. For tight, original insertion order is
  // fine (tie-break below is what matters).
  const eps = isCornerFirst
    ? [...state.epSet.points].sort(
        (a, b) => a.x + a.z + a.y - (b.x + b.z + b.y)
      )
    : state.epSet.points;
  let best: {
    score: number;
    min: { x: number; y: number; z: number };
    orient: Orientation;
  } | null = null;

  for (const orient of orientations) {
    for (const ep of eps) {
      if (
        ep.x < 0 ||
        ep.y < 0 ||
        ep.z < 0 ||
        ep.x + orient.l > state.bounds.l + 1e-6 ||
        ep.y + orient.h > state.bounds.h + 1e-6 ||
        ep.z + orient.w > state.bounds.w + 1e-6
      ) {
        continue;
      }
      const min = { x: ep.x, y: ep.y, z: ep.z };
      const v = runAllChecks({
        item,
        min,
        size: { l: orient.l, w: orient.w, h: orient.h },
        rot: orient.rot,
        grid: state.grid,
        bounds: state.bounds,
        placedItems: state.placedItems,
        topLoad: state.topLoad,
        minSupportRatio: state.minSupportRatio,
      });
      if (v.length > 0) continue;
      const score = bestFitScore({
        min,
        size: { l: orient.l, w: orient.w, h: orient.h },
        grid: state.grid,
        bounds: state.bounds,
        weights,
      });
      // Tie-break: prefer the candidate closest to the
      // back-left-floor corner (smaller x + z + y). This is
      // especially important in corner-first mode where many
      // candidates share the same (max) score, but also helps
      // tight mode produce more deterministic, easier-to-load
      // layouts.
      const candidateKey = min.x + min.z + min.y;
      const bestKey = best ? best.min.x + best.min.z + best.min.y : 0;
      const SCORE_TIE = 1e-3;
      if (
        best === null ||
        score > best.score + SCORE_TIE ||
        (Math.abs(score - best.score) <= SCORE_TIE && candidateKey < bestKey)
      ) {
        best = { score, min, orient };
      }
    }
  }
  return best;
}

export function greedyPack(
  items: OptimizationItem[],
  containerTypeId: ContainerTypeId,
  typeMap: TypeMap,
  options: GreedyOptions = {}
): GreedyResult {
  const minSupportRatio = options.minSupportRatio ?? 0.6;
  const weights =
    options.weights ?? weightsForStrategy(options.loadingStrategy);
  const container = typeMap.get(containerTypeId);
  if (!container) {
    throw new Error(
      `greedyPack: unknown containerTypeId "${containerTypeId}"`,
    );
  }
  const bounds: Bounds = {
    l: container.inner.l,
    w: container.inner.w,
    h: container.inner.h,
  };
  const state = createPackingState(bounds, items, minSupportRatio);
  const totalUnits = items.reduce((s, i) => s + (i.qty ?? 1), 0);
  let placedUnits = 0;

  const sorted = [...items].sort(
    (a, b) =>
      b.dims.l * b.dims.w * b.dims.h - a.dims.l * a.dims.w * a.dims.h
  );

  const placements: Placement[] = [];
  const unplaced: OptimizationItem[] = [];
  const placedIds = new Set<string>();

  for (const item of sorted) {
    if (options.isCancelled?.()) break;
    const unitQty = item.qty ?? 1;
    if (unitQty <= 0) continue;
    placedIds.add(item.id);

    // Phase 1: place the first unit at the best EP, then stack as
    // many identical units on top of it as the ceiling allows
    // (gravity stack, same footprint). This is space-efficient and
    // produces a tight column for full-pallet / uniform cargo.
    const candidate = findBestCandidate(state, item, weights);
    if (candidate === null) {
      // No EP fits even a single unit. Mark the whole lot unplaced.
      unplaced.push({ ...item, qty: unitQty });
      continue;
    }

    const firstPlaced = tryPlaceUnit(
      state,
      item,
      candidate.min,
      candidate.orient
    );
    if (!firstPlaced) {
      unplaced.push({ ...item, qty: unitQty });
      continue;
    }
    placedUnits++;
    let placedCount = 1;

    // Stack subsequent units directly above the first one.
    const stackBase = {
      x: candidate.min.x,
      y: candidate.min.y + candidate.orient.h,
      z: candidate.min.z,
    };
    while (placedCount < unitQty) {
      if (options.isCancelled?.()) break;
      if (stackBase.y + candidate.orient.h > state.bounds.h + 1e-6) break;
      const ok = tryPlaceUnit(state, item, stackBase, candidate.orient);
      if (!ok) break;
      placedCount++;
      placedUnits++;
      stackBase.y += candidate.orient.h;
      options.onProgress?.(placedUnits, totalUnits);
    }

    // Record the stacked column as a single placement.
    if (placedCount > 0) {
      placements.push({
        itemId: item.id,
        position: {
          x: candidate.min.x + candidate.orient.l / 2,
          y: candidate.min.y,
          z: candidate.min.z + candidate.orient.w / 2,
        },
        rot: candidate.orient.rot,
        size: {
          l: candidate.orient.l,
          w: candidate.orient.w,
          h: candidate.orient.h,
        },
        qty: placedCount,
      });
    }

    // Phase 2: if the column didn't fit every unit, place the
    // remainder one at a time at the next-best EPs. Each remaining
    // unit becomes its own placement so it can be rendered
    // independently in the 3D scene and exported correctly.
    while (placedCount < unitQty) {
      if (options.isCancelled?.()) break;
      const next = findBestCandidate(state, item, weights);
      if (next === null) break;
      const ok = tryPlaceUnit(state, item, next.min, next.orient);
      if (!ok) break;
      placements.push({
        itemId: item.id,
        position: {
          x: next.min.x + next.orient.l / 2,
          y: next.min.y,
          z: next.min.z + next.orient.w / 2,
        },
        rot: next.orient.rot,
        size: {
          l: next.orient.l,
          w: next.orient.w,
          h: next.orient.h,
        },
        qty: 1,
      });
      placedCount++;
      placedUnits++;
      options.onProgress?.(placedUnits, totalUnits);
    }

    // Phase 3: anything left over is genuinely unplaced. Push a
    // copy with the remaining qty so the UI can surface it.
    if (placedCount < unitQty) {
      unplaced.push({ ...item, qty: unitQty - placedCount });
    }
  }

  options.onProgress?.(placedUnits, totalUnits);
  return { placements, unplaced };
}

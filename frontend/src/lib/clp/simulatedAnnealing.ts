/**
 * Simulated Annealing improvement pass.
 *
 * Takes an initial greedy solution and tries to improve it via
 * random moves:
 *   - relocate: move one unit to a different EP / orientation
 *   - swap:     swap the positions of two units
 *   - rotate:   change a unit's orientation (re-stacks above it)
 *
 * Move acceptance follows the Metropolis criterion with
 * geometric cooling. The best-so-far solution is tracked
 * independently and returned.
 *
 * v1 implementation rebuilds the state from the placement list
 * on every accepted move (O(N) per move). This is slow but
 * correct and easy to reason about. A future version can
 * maintain an undo stack for O(1) move/revert.
 *
 * Container bounds and max-weight are resolved through a `typeMap`
 * passed by the caller, so the algorithm works in a Web Worker
 * that has its own module instance of the UI store.
 */

import type {
  ContainerType,
  ContainerTypeId,
} from "@/components/container-viewer/units";
import {
  type GreedyResult,
  greedyPack,
} from "./greedy";
import { generateOrientations } from "./orientations";
import { type ScoreWeights } from "./scoring";
import type {
  OptimizationItem,
  Orientation,
  Placement,
} from "./types";

type TypeMap = Map<ContainerTypeId, ContainerType>;

export interface SAOptions {
  iters: number;
  t0: number;
  alpha: number;
  randomSeed?: number;
  minSupportRatio?: number;
  /** Weight profile to use when re-running greedy on SA candidates.
   *  Should match the strategy used to produce the initial greedy
   *  solution. */
  weights?: ScoreWeights;
  onProgress?: (iter: number, total: number, currentCost: number) => void;
  isCancelled?: () => boolean;
}

interface PRNG {
  next(): number;
  int(max: number): number;
}

function mulberry32(seed: number): PRNG {
  let s = seed >>> 0;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(max) {
      return Math.floor(this.next() * max);
    },
  };
}

interface InternalPlacement {
  item: OptimizationItem;
  min: { x: number; y: number; z: number };
  orient: Orientation;
}

/** Compute the cost (lower = better) of a placement list. */
function costOf(
  placements: Placement[],
  unplaced: OptimizationItem[],
  bounds: { l: number; w: number; h: number },
  maxWeightKg: number,
  totalWeightKg: number,
  weightPenalty = 0.5
): number {
  // Volume fill.
  let usedVol = 0;
  for (const p of placements) {
    usedVol += p.size.l * p.size.w * p.size.h * p.qty;
  }
  const totalVol = bounds.l * bounds.w * bounds.h;
  const fill = totalVol > 0 ? usedVol / totalVol : 0;
  // Number of unplaced units (a big penalty).
  const unplacedPenalty = unplaced.reduce(
    (s, i) => s + (i.qty ?? 1) * 1e6,
    0
  );
  // Weight penalty if over the container max.
  const overWeight =
    totalWeightKg > maxWeightKg
      ? (totalWeightKg - maxWeightKg) * weightPenalty
      : 0;
  return -fill + unplacedPenalty + overWeight;
}

function repack(
  items: OptimizationItem[],
  containerTypeId: ContainerTypeId,
  typeMap: TypeMap,
  minSupportRatio: number,
  weights: ScoreWeights | undefined,
  onProgress?: (i: number, t: number) => void,
  isCancelled?: () => boolean
): GreedyResult {
  return greedyPack(items, containerTypeId, typeMap, {
    minSupportRatio,
    weights,
    onProgress: onProgress as (placed: number, total: number) => void,
    isCancelled,
  });
}

/** Public SA entry — improves on an existing greedy solution. */
export function simulatedAnnealing(
  items: OptimizationItem[],
  containerTypeId: ContainerTypeId,
  typeMap: TypeMap,
  initial: GreedyResult,
  options: SAOptions
): GreedyResult {
  if (options.iters <= 0) return initial;
  const container = typeMap.get(containerTypeId);
  if (!container) {
    throw new Error(
      `simulatedAnnealing: unknown containerTypeId "${containerTypeId}"`,
    );
  }
  const bounds = container.inner;
  const maxWeightKg = container.maxWeightKg;
  const rng = mulberry32(options.randomSeed ?? Date.now());
  const minSupportRatio = options.minSupportRatio ?? 0.6;
  const weights = options.weights;

  const totalWeightKg = items.reduce(
    (s, i) => s + i.weightKg * (i.qty ?? 1),
    0
  );

  // Build an internal placement list, one entry per unit.
  const units: InternalPlacement[] = [];
  const unitItems: OptimizationItem[] = [];
  for (const p of initial.placements) {
    const item = items.find((i) => i.id === p.itemId);
    if (!item) continue;
    const min = {
      x: p.position.x - p.size.l / 2,
      y: p.position.y,
      z: p.position.z - p.size.w / 2,
    };
    const orient: Orientation = {
      rot: p.rot,
      l: p.size.l,
      w: p.size.w,
      h: p.size.h,
    };
    for (let k = 0; k < p.qty; k++) {
      units.push({ item, min, orient });
      unitItems.push(item);
    }
  }

  // Build a working item list with qty=1 for SA.
  const flatItems: OptimizationItem[] = unitItems.map((it, idx) => ({
    ...it,
    id: `${it.id}#${idx}`,
    qty: 1,
  }));

  let current = initial;
  let currentCost = costOf(
    initial.placements,
    initial.unplaced,
    bounds,
    maxWeightKg,
    totalWeightKg
  );
  let best = current;
  let bestCost = currentCost;
  let T = options.t0;

  for (let iter = 0; iter < options.iters; iter++) {
    if (options.isCancelled?.()) break;
    // Pick a random move: 60% relocate, 30% swap, 10% rotate.
    const dice = rng.next();
    let attempt: GreedyResult | null = null;

    if (dice < 0.6) {
      // Relocate: shuffle placement order and re-greedy.
      const shuffled = [...flatItems].sort(() => rng.next() - 0.5);
      attempt = repack(shuffled, containerTypeId, typeMap, minSupportRatio, weights);
    } else if (dice < 0.9) {
      // Swap: swap the items of two random units, re-greedy.
      if (flatItems.length < 2) continue;
      const i = rng.int(flatItems.length);
      let j = rng.int(flatItems.length);
      if (i === j) j = (j + 1) % flatItems.length;
      const swapped = [...flatItems];
      const a = swapped[i];
      const b = swapped[j];
      if (a && b) {
        swapped[i] = { ...b, id: a.id, qty: 1 };
        swapped[j] = { ...a, id: b.id, qty: 1 };
      }
      attempt = repack(swapped, containerTypeId, typeMap, minSupportRatio, weights);
    } else {
      // Rotate: change orientation of a random unit, re-greedy.
      if (flatItems.length === 0) continue;
      const i = rng.int(flatItems.length);
      const target = flatItems[i];
      if (!target) continue;
      const orients = generateOrientations(
        target.dims.l,
        target.dims.w,
        target.dims.h
      );
      const alt = orients[(orients.findIndex((o) => o.rot === 0) + 1) % orients.length];
      if (!alt) continue;
      const newItem = {
        ...target,
        dims: { l: alt.l, w: alt.w, h: alt.h },
      };
      const swapped = [...flatItems];
      swapped[i] = newItem;
      attempt = repack(swapped, containerTypeId, typeMap, minSupportRatio, weights);
    }

    if (attempt === null) {
      T *= options.alpha;
      continue;
    }
    const newCost = costOf(
      attempt.placements,
      attempt.unplaced,
      bounds,
      maxWeightKg,
      totalWeightKg
    );
    const delta = newCost - currentCost;
    if (delta < 0 || rng.next() < Math.exp(-delta / T)) {
      current = attempt;
      currentCost = newCost;
    }
    if (currentCost < bestCost) {
      best = current;
      bestCost = currentCost;
    }
    T *= options.alpha;
    if (iter % Math.max(1, Math.floor(options.iters / 20)) === 0) {
      options.onProgress?.(iter, options.iters, bestCost);
    }
  }
  options.onProgress?.(options.iters, options.iters, bestCost);
  return best;
}

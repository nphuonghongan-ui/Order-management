/**
 * Outer bin-packing modes.
 *
 *   - `single`: try each container type, return the best-ranked one.
 *   - `split`:  first-fit-decreasing into N containers of a chosen type.
 *   - `auto`:   try `single` first; if no single container fits all
 *               items OR best single fill% < 70%, fall back to `split`.
 *
 * The "best" container type is ranked by:
 *   score = fillPct - 0.01 * costFactor * 100
 * i.e. fill dominates; cost is a small tiebreaker.
 *
 * Container data is supplied via `input.containerTypes` (and resolved
 * through a `typeMap`) instead of pulled from a UI store. The optimizer
 * runs inside a Web Worker that has its own module instance of the
 * store, so the main thread must ship the data with each optimize
 * message.
 */

import type {
  ContainerType,
  ContainerTypeId,
} from "@/components/container-viewer/units";
import { greedyPack } from "./greedy";
import { simulatedAnnealing } from "./simulatedAnnealing";
import { weightsForStrategy } from "./scoring";
import {
  colorForPo,
  combinePoAndItemColor,
} from "./poColor";
import type {
  CLPInput,
  CLPResult,
  CLPMode,
  OptimizationItem,
  PerContainerResult,
} from "./types";
import type { BoxPlacement } from "@/components/container-viewer/types";

type TypeMap = Map<ContainerTypeId, ContainerType>;

function requireType(
  typeMap: TypeMap,
  containerTypeId: ContainerTypeId,
): ContainerType {
  const c = typeMap.get(containerTypeId);
  if (!c) {
    throw new Error(
      `Unknown container type "${containerTypeId}" — not in input.containerTypes`,
    );
  }
  return c;
}

function buildPerContainer(
  containerTypeId: ContainerTypeId,
  placements: import("./types").Placement[],
  unplaced: OptimizationItem[],
  sourceItems: OptimizationItem[],
  typeMap: TypeMap,
): PerContainerResult {
  const container = requireType(typeMap, containerTypeId);
  const totalVol = container.inner.l * container.inner.w * container.inner.h;
  let usedVol = 0;
  let weight = 0;
  // Build a lookup from the *full* input list (not just unplaced)
  // so we can resolve partNum / poNum / weightKg for placed items
  // too. The previous version only indexed unplaced, which meant
  // every placed BoxPlacement lost its metadata and fell back to
  // the itemId for partNum and undefined for poNum.
  const itemMap = new Map<string, OptimizationItem>();
  for (const it of sourceItems) itemMap.set(it.id, it);
  const boxPlacements: BoxPlacement[] = [];
  for (const p of placements) {
    usedVol += p.size.l * p.size.w * p.size.h * p.qty;
    const it = itemMap.get(p.itemId);
    if (it) weight += it.weightKg * p.qty;
    // Color: PO color is the base so every box of a given order
    // shares a hue; an explicit per-item color is blended on top
    // (40 % weight) so the PO identity stays dominant.
    const poColor = colorForPo(
      it?.poNum,
      it?.partNum ?? p.itemId,
    );
    const color = combinePoAndItemColor(poColor, it?.color, 0.4);
    // split grouped placement into individual BoxPlacement rows so the
    // 3D scene can render them (existing store expects 1 unit per row).
    for (let k = 0; k < p.qty; k++) {
      boxPlacements.push({
        id: `${p.itemId}#${k}`,
        partNum: it?.partNum ?? p.itemId,
        poNum: it?.poNum,
        size: p.size,
        // First unit at base; subsequent units stacked above (y+=h per unit).
        // The optimizer uses back-left-floor as its origin and stores the
        // box's center in `p.position`. The 3D scene, however, uses
        // center-of-floor as its origin (Container.tsx centers the shell
        // at the world origin), so we shift by -half the container's
        // inner length / width to convert between the two conventions.
        position: {
          x: p.position.x - container.inner.l / 2,
          y: p.position.y + k * p.size.h,
          z: p.position.z - container.inner.w / 2,
        },
        rotationY: p.rot,
        weightKg: it?.weightKg ?? 0,
        qty: 1,
        color,
      });
    }
  }
  return {
    containerTypeId,
    placements: boxPlacements,
    unplaced,
    fillPct: totalVol > 0 ? (usedVol / totalVol) * 100 : 0,
    weightUsedKg: weight,
    computeMs: 0,
    iterations: 0,
  };
}

/** Run greedy (+ optional SA) inside a single container. */
function packOne(
  items: OptimizationItem[],
  containerTypeId: ContainerTypeId,
  input: CLPInput,
  typeMap: TypeMap,
  onProgress?: (info: { iter: number; total: number; bestCost?: number }) => void
): PerContainerResult {
  const start = performance.now();
  const minSupportRatio = input.minSupportRatio ?? 0.6;
  const weights = weightsForStrategy(input.loadingStrategy);
  const greedy = greedyPack(items, containerTypeId, typeMap, {
    minSupportRatio,
    loadingStrategy: input.loadingStrategy,
    weights,
  });
  let best = greedy;
  const saIters = input.saIters ?? 0;
  if (saIters > 0) {
    best = simulatedAnnealing(items, containerTypeId, typeMap, greedy, {
      iters: saIters,
      t0: input.saT0 ?? 1.0,
      alpha: input.saAlpha ?? 0.997,
      randomSeed: input.randomSeed,
      minSupportRatio,
      weights,
      onProgress: (i, t, c) => onProgress?.({ iter: i, total: t, bestCost: c }),
    });
  }
  const per = buildPerContainer(containerTypeId, best.placements, best.unplaced, items, typeMap);
  per.computeMs = performance.now() - start;
  per.iterations = saIters;
  return per;
}

function rank(p: PerContainerResult, typeMap: TypeMap): number {
  const container = requireType(typeMap, p.containerTypeId);
  // Fill dominates, cost is a tiebreaker. Lower rank = better.
  return p.fillPct - 0.01 * container.costFactor * 100;
}

function totalUnits(items: OptimizationItem[]): number {
  return items.reduce((s, i) => s + (i.qty ?? 1), 0);
}

function placedUnits(p: PerContainerResult): number {
  let n = 0;
  for (const pl of p.placements) n += pl.qty;
  return n;
}

/** `auto` / `single` mode — return the best single-container
 *  result. If no single container fits all items, the caller
 *  should fall back to `split` mode. */
function runSingle(
  items: OptimizationItem[],
  input: CLPInput,
  typeMap: TypeMap,
): { per: PerContainerResult; allPlaced: boolean }[] {
  return input.availableContainers.map((cid) => {
    const per = packOne(items, cid, input, typeMap);
    return { per, allPlaced: placedUnits(per) === totalUnits(items) };
  });
}

/** `split` mode — first-fit-decreasing across multiple containers. */
function runSplit(
  items: OptimizationItem[],
  input: CLPInput,
  typeMap: TypeMap,
): PerContainerResult[] {
  const maxContainers = input.maxContainers ?? 10;
  const out: PerContainerResult[] = [];
  const remaining: OptimizationItem[] = items.map((i) => ({
    ...i,
    qty: i.qty ?? 1,
  }));

  while (remaining.length > 0 && out.length < maxContainers) {
    // Pick the cheapest container type that fits the largest item.
    const largest = remaining[0];
    if (!largest) break;
    const maxDim = Math.max(
      largest.dims.l,
      largest.dims.w,
      largest.dims.h
    );
    const candidates = input.availableContainers
      .map((cid) => {
        const c = requireType(typeMap, cid);
        return {
          cid,
          c,
          fits: c.inner.l >= maxDim && c.inner.w >= maxDim && c.inner.h >= maxDim,
        };
      })
      .filter((x) => x.fits)
      .sort((a, b) => a.c.costFactor - b.c.costFactor);
    const chosen = candidates[0]?.cid;
    if (!chosen) break; // nothing fits, give up

    // Pack the largest items first into the chosen container.
    const sortedRemaining = [...remaining].sort(
      (a, b) =>
        b.dims.l * b.dims.w * b.dims.h - a.dims.l * a.dims.w * a.dims.h
    );
    const per = packOne(sortedRemaining, chosen, input, typeMap);
    out.push(per);

    // Remove placed items from `remaining`.
    const placedQty = new Map<string, number>();
    // Simpler: subtract qty from remaining by matching partNum+size.
    for (const p of per.placements) {
      // Find a remaining item with same partNum+size+weight.
      const match = remaining.find(
        (r) =>
          r.partNum === p.partNum &&
          r.dims.l === p.size.l &&
          r.dims.w === p.size.w &&
          r.dims.h === p.size.h
      );
      if (match) {
        const cur = placedQty.get(match.id) ?? 0;
        if (cur < (match.qty ?? 1)) {
          placedQty.set(match.id, cur + 1);
        }
      }
    }
    const next: OptimizationItem[] = [];
    for (const r of remaining) {
      const used = placedQty.get(r.id) ?? 0;
      const rem = (r.qty ?? 1) - used;
      if (rem > 0) {
        next.push({ ...r, qty: rem });
      }
    }
    if (next.length === remaining.length) {
      // No progress — break to avoid infinite loop.
      break;
    }
    remaining.length = 0;
    remaining.push(...next);
  }
  return out;
}

function runId(): string {
  return `run-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function aggregate(
  mode: CLPMode,
  containers: PerContainerResult[],
  typeMap: TypeMap,
): CLPResult {
  let totalPlaced = 0;
  let totalFill = 0;
  let totalWeight = 0;
  let totalCost = 0;
  let totalVolumeAll = 0;
  for (const c of containers) {
    const cont = requireType(typeMap, c.containerTypeId);
    totalPlaced += placedUnits(c);
    totalWeight += c.weightUsedKg;
    totalCost += cont.costFactor;
    const vol = cont.inner.l * cont.inner.w * cont.inner.h;
    totalFill += c.fillPct * vol;
    totalVolumeAll += vol;
  }
  return {
    mode,
    containers,
    totalCost,
    totalItemsPlaced: totalPlaced,
    totalItems: totalPlaced, // overwritten by caller
    totalFillPct: totalVolumeAll > 0 ? totalFill / totalVolumeAll : 0,
    totalWeightKg: totalWeight,
    runId: runId(),
    allPlaced: true, // overwritten by caller
    createdAt: Date.now(),
  };
}

export interface OptimizeProgressInfo {
  phase: "single" | "split" | "sa";
  current: number;
  total: number;
  bestPerContainer: { containerTypeId: ContainerTypeId; fillPct: number }[];
}

export interface OptimizeOptions {
  onProgress?: (info: OptimizeProgressInfo) => void;
  isCancelled?: () => boolean;
}

export function optimize(
  input: CLPInput,
  options: OptimizeOptions = {}
): CLPResult {
  const items = input.items;
  const totalItems = totalUnits(items);

  if (!input.containerTypes || input.containerTypes.length === 0) {
    throw new Error(
      "optimize() requires input.containerTypes to be populated.",
    );
  }
  const typeMap: TypeMap = new Map(
    input.containerTypes.map((c) => [c.typeId, c]),
  );

  if (items.length === 0) {
    return {
      mode: input.mode,
      containers: [],
      totalCost: 0,
      totalItemsPlaced: 0,
      totalItems: 0,
      totalFillPct: 0,
      totalWeightKg: 0,
      runId: runId(),
      allPlaced: true,
      createdAt: Date.now(),
    };
  }

  let actualMode: CLPMode = input.mode;
  let containers: PerContainerResult[] = [];

  if (input.mode === "single" || input.mode === "auto") {
    const singles = runSingle(items, input, typeMap);
    const sortedSingles = [...singles].sort(
      (a, b) => rank(b.per, typeMap) - rank(a.per, typeMap)
    );
    options.onProgress?.({
      phase: "single",
      current: 1,
      total: 1,
      bestPerContainer: sortedSingles.map((s) => ({
        containerTypeId: s.per.containerTypeId,
        fillPct: s.per.fillPct,
      })),
    });
    const best = sortedSingles[0];
    if (
      best &&
      (input.mode === "single" ||
        (best.allPlaced && best.per.fillPct >= 70))
    ) {
      containers = [best.per];
      actualMode = "single";
    } else if (input.mode === "auto") {
      // Fall through to split.
    } else {
      containers = best ? [best.per] : [];
      actualMode = "single";
    }
  }

  if (containers.length === 0) {
    actualMode = "split";
    options.onProgress?.({
      phase: "split",
      current: 0,
      total: input.maxContainers ?? 10,
      bestPerContainer: [],
    });
    containers = runSplit(items, input, typeMap);
  }

  const result = aggregate(actualMode, containers, typeMap);
  result.totalItems = totalItems;
  result.allPlaced = result.totalItemsPlaced >= totalItems;
  return result;
}

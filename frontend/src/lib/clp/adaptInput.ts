/**
 * Adapter: turn a PackingListRecord (frontend types) into a
 * CLPInput ready for the optimizer.
 *
 * Each PickedItem with `qty = N` becomes a single OptimizationItem
 * with `qty = N` (so the optimizer can stack identical units as
 * a tower). The caller can opt into `groupIdentical` (default
 * true) to collapse consecutive identical items into one record.
 */

import type { PackingListRecord } from "@/components/packing-list/types";
import type { ContainerType } from "@/components/container-viewer/units";
import type { CLPInput, LoadingStrategy, OptimizationItem } from "./types";

export interface AdaptInputArgs {
  record: PackingListRecord;
  partNumToDim: Map<string, { length: number; width: number; height: number }>;
  availableContainers: string[];
  containerTypes: ContainerType[];
  mode: CLPInput["mode"];
  groupIdentical?: boolean;
  saIters?: number;
  saT0?: number;
  saAlpha?: number;
  minSupportRatio?: number;
  maxContainers?: number;
  randomSeed?: number;
  loadingStrategy?: LoadingStrategy;
}

export function packingListToCLPInput(args: AdaptInputArgs): CLPInput {
  const dimMap = args.partNumToDim;
  const items: OptimizationItem[] = [];

  for (const it of args.record.items) {
    const dim = dimMap.get(it.partNum);
    if (!dim) continue;
    const qty = it.qty ?? 1;
    if (qty <= 0) continue;
    items.push({
      id: it.lineId,
      partNum: it.partNum,
      poNum: it.poNum,
      dims: { l: dim.length, w: dim.width, h: dim.height },
      weightKg: 0,
      qty,
    });
  }

  let finalItems = items;
  if (args.groupIdentical !== false) {
    finalItems = groupIdenticalItems(items);
  }

  return {
    items: finalItems,
    availableContainers: args.availableContainers as CLPInput["availableContainers"],
    containerTypes: args.containerTypes,
    mode: args.mode,
    saIters: args.saIters,
    saT0: args.saT0,
    saAlpha: args.saAlpha,
    minSupportRatio: args.minSupportRatio,
    maxContainers: args.maxContainers,
    randomSeed: args.randomSeed,
    groupIdentical: args.groupIdentical !== false,
    loadingStrategy: args.loadingStrategy,
  };
}

/** Merge consecutive items with the same partNum + dims into one
 *  OptimizationItem with summed qty. */
function groupIdenticalItems(
  items: OptimizationItem[]
): OptimizationItem[] {
  const out: OptimizationItem[] = [];
  for (const it of items) {
    const last = out[out.length - 1];
    if (
      last &&
      last.partNum === it.partNum &&
      last.dims.l === it.dims.l &&
      last.dims.w === it.dims.w &&
      last.dims.h === it.dims.h &&
      last.poNum === it.poNum
    ) {
      last.qty = (last.qty ?? 1) + (it.qty ?? 1);
    } else {
      out.push({ ...it, qty: it.qty ?? 1 });
    }
  }
  return out;
}

/**
 * Types for the Container Loading Problem (CLP) optimizer.
 *
 * Coordinates: all in centimetres, container-local origin at the
 * floor center. The 3D scene uses the same convention (see
 * `components/container-viewer/units.ts`).
 *
 * - +X  length axis (container left → right)
 * - +Y  up (floor → ceiling)
 * - +Z  width axis (container front → back)
 */

import type { AxisRotation, BoxPlacement } from "@/components/container-viewer/types";
import type {
  ContainerType,
  ContainerTypeId,
} from "@/components/container-viewer/units";

/** A single unpacked unit the optimizer must place. */
export interface OptimizationItem {
  /** Stable id (e.g. `${partNum}#${index}` or `lineId#${i}`). */
  id: string;
  partNum: string;
  /** Axis-aligned dimensions in cm (before rotation). */
  dims: { l: number; w: number; h: number };
  /** Per-unit weight in kg. 0 disables stack-weight limits. */
  weightKg: number;
  /**
   * How many identical units this item represents. The optimizer
   * will try to place all of them, ideally as a stacked tower
   * for compactness. Default 1.
   */
  qty: number;
  /**
   * Six axis-aligned orientation permutations. Each entry is the
   * 3D extent that results from rotating the canonical (l, w, h)
   * by the given Y rotation. Filter via `allowedOrientations` if
   * some rotations are forbidden (e.g. "this side may not lay
   * flat").
   */
  allowedOrientations?: Orientation[];
  /**
   * Maximum weight (kg) allowed to be stacked on top of a single
   * unit of this item. Undefined ⇒ no per-item limit.
   */
  maxStackKg?: number;
  /** Cosmetic color override for the 3D preview. */
  color?: string;
  /** PO number for grouping in the UI. */
  poNum?: string;
}

/**
 * A candidate orientation: the box's rendered extent (l, w, h)
 * after rotating by 0/90/180/270° about the Y axis. The original
 * (l, w, h) is the post-rotation extent for `rot = 0`.
 */
export interface Orientation {
  rot: AxisRotation;
  /** Rendered extent after rotation. */
  l: number;
  w: number;
  /** Height is rotation-invariant; copied for convenience. */
  h: number;
}

/** A box placed inside a container. */
export interface Placement {
  itemId: string;
  /** Container origin (cm). */
  position: { x: number; y: number; z: number };
  rot: AxisRotation;
  /** Rendered extent (post-rotation). */
  size: { l: number; w: number; h: number };
  /** Grouped qty — when > 1, this placement represents N identical
   *  units stacked as a tower. */
  qty: number;
}

/** Inner dimensions of a container, used for bounds checks. */
export type ContainerBounds = { l: number; w: number; h: number };

/** Input shape for the optimizer. */
export interface CLPInput {
  items: OptimizationItem[];
  /** Container types the optimizer may use. */
  availableContainers: ContainerTypeId[];
  /**
   * Full container type definitions. The optimizer runs in a Web
   * Worker which has its own module instance of the UI store, so
   * container data is shipped with the message instead of being
   * read from a store. The main thread passes the same list it
   * just fetched via `/api/containers`.
   */
  containerTypes: ContainerType[];
  /** Outer bin-packing mode. */
  mode: CLPMode;
  /** Cap for split mode. Defaults to 10. */
  maxContainers?: number;
  /** SA iterations per container. 0 ⇒ greedy only. */
  saIters?: number;
  /** Initial SA temperature. */
  saT0?: number;
  /** SA cooling factor (0 < alpha < 1). */
  saAlpha?: number;
  /** Deterministic seed (default: time-based). */
  randomSeed?: number;
  /** Group identical items into single placements (default true). */
  groupIdentical?: boolean;
  /** Min support ratio on top of another box (0..1). Default 0.6. */
  minSupportRatio?: number;
  /**
   * Placement strategy within a single container. Default `"tight"`.
   * See `LoadingStrategy` for the meaning of each value.
   */
  loadingStrategy?: LoadingStrategy;
}

export type CLPMode = "auto" | "single" | "split";

/**
 * How the optimizer should bias placement within a single container.
 *
 * - `tight` (default): best-fit / max-contact scoring — boxes nest
 *   together to maximize fill. Good for uniform, palletized cargo.
 * - `corner-first`: anchor each box at the back-left-floor corner
 *   (0, 0, 0) and build outward, preferring wall + floor contact
 *   over interior contact. Good for "easy cargo" / loose-loaded
 *   cargo where the loader enters from the front door.
 */
export type LoadingStrategy = "tight" | "corner-first";

/** Per-container result. */
export interface PerContainerResult {
  containerTypeId: ContainerTypeId;
  placements: BoxPlacement[];
  unplaced: OptimizationItem[];
  fillPct: number;
  weightUsedKg: number;
  computeMs: number;
  iterations: number;
}

/** Top-level result. */
export interface CLPResult {
  /** The mode that was actually used (auto may select single or split). */
  mode: CLPMode;
  /** One entry per container used. Empty if everything unplaced. */
  containers: PerContainerResult[];
  /** Sum of `containerTypeId` costFactors. Lower = cheaper overall. */
  totalCost: number;
  /** Items placed (sum across containers). */
  totalItemsPlaced: number;
  /** Items requested (sum of input qty). */
  totalItems: number;
  /** Weighted-average fill % across containers. */
  totalFillPct: number;
  /** Total weight across containers. */
  totalWeightKg: number;
  /** Unique run id, used for navigation to per-container editor. */
  runId: string;
  /** Whether every requested unit was placed. */
  allPlaced: boolean;
  /** Timestamp (ms since epoch). */
  createdAt: number;
}

/** A constraint violation reported by the rule engine. */
export interface ConstraintViolation {
  kind:
    | "out-of-bounds"
    | "overlap"
    | "unsupported"
    | "stack-weight"
    | "orientation";
  message: string;
}

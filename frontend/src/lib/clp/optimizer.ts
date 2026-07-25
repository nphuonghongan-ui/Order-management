/**
 * Thin entry point that re-exports the public API of the CLP
 * library. Components and stores should import from here rather
 * than reaching into individual files.
 */

export type {
  AxisRotation,
  BoxPlacement,
} from "@/components/container-viewer/types";
export type { ContainerTypeId } from "@/components/container-viewer/units";
export type {
  CLPInput,
  CLPMode,
  CLPResult,
  ConstraintViolation,
  OptimizationItem,
  Orientation,
  PerContainerResult,
  Placement,
} from "./types";

export { greedyPack } from "./greedy";
export { simulatedAnnealing } from "./simulatedAnnealing";
export { optimize, type OptimizeOptions, type OptimizeProgressInfo } from "./binPacking";
export { packingListToCLPInput } from "./adaptInput";

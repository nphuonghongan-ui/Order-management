import type { ContainerTypeId } from "./units";

/** Axis-aligned rotation about the Y axis (Z is up in screen, but Y is up in scene). */
export type AxisRotation = 0 | 90 | 180 | 270;

export interface BoxPlacement {
  id: string;
  partNum: string;
  poNum?: string;
  /** Size in mm. */
  size: { l: number; w: number; h: number };
  /** Center position in mm, container-local. */
  position: { x: number; y: number; z: number };
  /** Y-axis rotation in degrees (rounded to 90° for axis-aligned packing). */
  rotationY: AxisRotation;
  weightKg: number;
  qty: number;
  color?: string;
}

export type ToolMode = "select" | "move" | "rotate" | "scale";

export type ViewPreset = "iso" | "top" | "front" | "right";

export interface ViewState {
  preset: ViewPreset;
}

export interface SceneStats {
  totalVolumeMm3: number;
  usedVolumeMm3: number;
  fillPct: number;
  totalWeightKg: number;
  boxCount: number;
}

export interface ContainerSceneState {
  containerTypeId: ContainerTypeId;
  boxes: BoxPlacement[];
  selectedId: string | null;
  tool: ToolMode;
  snapMm: number;
  rotationSnapDeg: number;
  showWalls: boolean;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  axisConstraint: AxisConstraint;
  space: TransformSpace;
}

export type AxisConstraint = "all" | "x" | "y" | "z";
export type TransformSpace = "world" | "local";

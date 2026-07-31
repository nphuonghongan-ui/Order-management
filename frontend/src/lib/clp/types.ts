export type ContainerTypeId = "20GP" | "40GP" | "40HC" | "45HC";

export const CONTAINER_TYPE_IDS: ContainerTypeId[] = [
  "20GP",
  "40GP",
  "40HC",
  "45HC",
];

export type AxisRotation = 0 | 90 | 180 | 270;

export interface BoxPlacement {
  id: string;
  partNum: string;
  poNum?: string;
  size: { l: number; w: number; h: number };
  position: { x: number; y: number; z: number };
  rotationY: AxisRotation;
  weightKg: number;
  qty: number;
  color?: string;
}

export type ToolMode = "select" | "move" | "rotate" | "scale";

export type ViewPreset = "iso" | "top" | "front" | "right";

export type AxisConstraint = "all" | "x" | "y" | "z";

export type TransformSpace = "world" | "local";

export interface ClpStats {
  fillPct: number;
  weightKg: number;
  itemCount: number;
  volumeMm3: number;
  usedVolumeMm3: number;
}

export interface ClpOptimizeResponse {
  containerTypeId: ContainerTypeId;
  placements: BoxPlacement[];
  stats: ClpStats;
  skippedPartNums: string[];
}

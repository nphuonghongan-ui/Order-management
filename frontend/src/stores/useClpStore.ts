import { create } from "zustand";
import type {
  ToolMode,
  ViewPreset,
  AxisConstraint,
  TransformSpace,
} from "@/lib/clp/types";

interface ClpViewerState {
  selectedId: string | null;
  tool: ToolMode;
  axisConstraint: AxisConstraint;
  space: TransformSpace;
  view: ViewPreset;
  showWalls: boolean;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;

  setSelectedId: (id: string | null) => void;
  setTool: (tool: ToolMode) => void;
  setAxisConstraint: (axis: AxisConstraint) => void;
  setSpace: (space: TransformSpace) => void;
  setView: (view: ViewPreset) => void;
  toggleWalls: () => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  toggleLabels: () => void;
  reset: () => void;
}

const initial = {
  selectedId: null as string | null,
  tool: "select" as ToolMode,
  axisConstraint: "all" as AxisConstraint,
  space: "world" as TransformSpace,
  view: "iso" as ViewPreset,
  showWalls: true,
  showGrid: true,
  showAxes: true,
  showLabels: true,
};

export const useClpStore = create<ClpViewerState>((set) => ({
  ...initial,
  setSelectedId: (id) => set({ selectedId: id }),
  setTool: (tool) => set({ tool }),
  setAxisConstraint: (axis) => set({ axisConstraint: axis }),
  setSpace: (space) => set({ space }),
  setView: (view) => set({ view }),
  toggleWalls: () => set((s) => ({ showWalls: !s.showWalls })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleAxes: () => set((s) => ({ showAxes: !s.showAxes })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  reset: () => set(initial),
}));

import { create } from "zustand";
import type {
  AxisConstraint,
  AxisRotation,
  BoxPlacement,
  ContainerSceneState,
  ToolMode,
  TransformSpace,
  ViewPreset,
} from "../components/container-viewer/types";
import { getContainerType, type ContainerTypeId } from "../components/container-viewer/units";

interface HistoryEntry {
  boxes: BoxPlacement[];
}

interface Actions {
  setContainerType: (id: ContainerTypeId) => void;
  setBoxes: (boxes: BoxPlacement[]) => void;
  selectBox: (id: string | null) => void;
  setTool: (t: ToolMode) => void;
  setSnapCm: (n: number) => void;
  setRotationSnapDeg: (n: number) => void;
  setShowWalls: (b: boolean) => void;
  setShowGrid: (b: boolean) => void;
  setShowAxes: (b: boolean) => void;
  setShowLabels: (b: boolean) => void;
  setAxisConstraint: (a: AxisConstraint) => void;
  setSpace: (s: TransformSpace) => void;
  setView: (v: ViewPreset) => void;
  updateBoxPosition: (id: string, x: number, y: number, z: number) => void;
  updateBoxRotation: (id: string, rot: AxisRotation) => void;
  setBoxPositionXYZ: (id: string, x: number, y: number, z: number) => void;
  setBoxRotation90: (id: string, deg: 0 | 90 | 180 | 270) => void;
  resetBoxTransform: (id: string) => void;
  recenterBox: (id: string) => void;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  setContextLost: (lost: boolean) => void;
  forceContextRestore: () => number;
}

type Store = ContainerSceneState & {
  view: ViewPreset;
  past: HistoryEntry[];
  future: HistoryEntry[];
  contextLost: boolean;
  /** Increments on every forceContextRestore() call. The Canvas remounts on change. */
  contextEpoch: number;
} & Actions;

const HISTORY_LIMIT = 50;

function snap(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

function snapRotation(deg: number, step: number): AxisRotation {
  const normalized = ((deg % 360) + 360) % 360;
  const snapped = Math.round(normalized / step) * step;
  const rounded = Math.round(snapped) as AxisRotation;
  return (rounded % 360) as AxisRotation;
}

const initialBoxes: BoxPlacement[] = [];

export const useContainerStore = create<Store>((set) => ({
  containerTypeId: "40HC",
  boxes: initialBoxes,
  selectedId: null,
  tool: "select",
  snapCm: 1,
  rotationSnapDeg: 90,
  showWalls: true,
  showGrid: true,
  showAxes: true,
  showLabels: true,
  axisConstraint: "all",
  space: "world",
  view: "iso",
  past: [],
  future: [],
  contextLost: false,
  contextEpoch: 0,

  setContainerType: (id) =>
    set((s) => {
      if (s.containerTypeId === id) return s;
      return {
        containerTypeId: id,
        past: pushHistory(s.past, s.boxes),
        future: [],
      };
    }),

  setBoxes: (boxes) =>
    set((s) => ({
      boxes,
      past: pushHistory(s.past, s.boxes),
      future: [],
    })),

  selectBox: (id) => set({ selectedId: id }),

  setTool: (tool) => set({ tool }),

  setSnapCm: (n) => set({ snapCm: Math.max(0, n) }),

  setRotationSnapDeg: (n) =>
    set({ rotationSnapDeg: Math.max(1, Math.min(180, n)) }),

  setShowWalls: (b) => set({ showWalls: b }),
  setShowGrid: (b) => set({ showGrid: b }),
  setShowAxes: (b) => set({ showAxes: b }),
  setShowLabels: (b) => set({ showLabels: b }),

  setAxisConstraint: (a) => set({ axisConstraint: a }),
  setSpace: (s) => set({ space: s }),

  setView: (v) => set({ view: v }),

  updateBoxPosition: (id, x, y, z) =>
    set((s) => {
      const step = s.snapCm;
      const boxes = s.boxes.map((b) =>
        b.id === id
          ? {
              ...b,
              position: {
                x: snap(x, step),
                y: snap(y, step),
                z: snap(z, step),
              },
            }
          : b,
      );
      return { boxes };
    }),

  updateBoxRotation: (id, rot) =>
    set((s) => {
      const boxes = s.boxes.map((b) =>
        b.id === id
          ? { ...b, rotationY: snapRotation(rot, s.rotationSnapDeg) }
          : b,
      );
      return { boxes };
    }),

  commitHistory: () =>
    set((s) => ({
      past: pushHistory(s.past, s.boxes),
      future: [],
    })),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return {
        past: s.past.slice(0, -1),
        future: [{ boxes: s.boxes }, ...s.future].slice(0, HISTORY_LIMIT),
        boxes: prev.boxes,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        past: pushHistory(s.past, s.boxes),
        future: s.future.slice(1),
        boxes: next.boxes,
      };
    }),

  reset: () =>
    set({
      boxes: initialBoxes,
      selectedId: null,
      past: [],
      future: [],
    }),

  setBoxPositionXYZ: (id, x, y, z) =>
    set((s) => {
      const step = s.snapCm;
      const boxes = s.boxes.map((b) =>
        b.id === id
          ? {
              ...b,
              position: {
                x: snap(x, step),
                y: snap(y, step),
                z: snap(z, step),
              },
            }
          : b,
      );
      return { boxes, past: pushHistory(s.past, s.boxes), future: [] };
    }),

  setBoxRotation90: (id, deg) =>
    set((s) => ({
      boxes: s.boxes.map((b) =>
        b.id === id ? { ...b, rotationY: deg } : b,
      ),
      past: pushHistory(s.past, s.boxes),
      future: [],
    })),

  resetBoxTransform: (id) =>
    set((s) => ({
      boxes: s.boxes.map((b) =>
        b.id === id
          ? { ...b, position: { x: 0, y: 0, z: 0 }, rotationY: 0 }
          : b,
      ),
      past: pushHistory(s.past, s.boxes),
      future: [],
    })),

  recenterBox: (id) =>
    set((s) => ({
      boxes: s.boxes.map((b) =>
        b.id === id
          ? { ...b, position: { x: 0, y: b.size.h / 2, z: 0 } }
          : b,
      ),
      past: pushHistory(s.past, s.boxes),
      future: [],
    })),

  setContextLost: (lost) =>
    set((s) => (s.contextLost === lost ? s : { contextLost: lost })),

  forceContextRestore: () => {
    let epoch = 0;
    set((s) => {
      epoch = s.contextEpoch + 1;
      return { contextEpoch: epoch, contextLost: false };
    });
    return epoch;
  },
}));

function pushHistory(past: HistoryEntry[], boxes: BoxPlacement[]): HistoryEntry[] {
  const next = [...past, { boxes }];
  if (next.length > HISTORY_LIMIT) next.shift();
  return next;
}

/** Compute scene stats for the current container + boxes. */
export function computeStats(state: ContainerSceneState) {
  const t = getContainerType(state.containerTypeId);
  const capacity = t.inner.l * t.inner.w * t.inner.h;
  let used = 0;
  let weight = 0;
  for (const b of state.boxes) {
    used += b.size.l * b.size.w * b.size.h * b.qty;
    weight += b.weightKg * b.qty;
  }
  return {
    totalVolumeMm3: capacity,
    usedVolumeMm3: used,
    fillPct: capacity > 0 ? (used / capacity) * 100 : 0,
    totalWeightKg: weight,
    boxCount: state.boxes.reduce((sum, b) => sum + b.qty, 0),
  };
}

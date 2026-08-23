import { create } from "zustand";
import type {
  ContainerTypeId,
  Yard,
  YardContainer,
  YardContainerStatus,
  YardLayout,
  YardUpdateEvent,
  YardViewPreset,
} from "@/components/yard-viewer/yardTypes";

export interface YardFilters {
  typeId: ContainerTypeId | "ALL";
  status: YardContainerStatus | "ALL";
}

interface YardState {
  yards: Yard[];
  yardsLoaded: boolean;
  selectedYardId: string | null;
  layout: YardLayout | null;
  layoutLoading: boolean;
  layoutError: string | null;

  view: YardViewPreset;
  density: "standard" | "dense";
  filters: YardFilters;
  blockFilter: string;

  selectedSlotId: string | null;
  draggingContainerId: string | null;

  setYards: (yards: Yard[]) => void;
  setSelectedYard: (id: string) => void;
  setLayout: (layout: YardLayout | null) => void;
  setLayoutLoading: (loading: boolean) => void;
  setLayoutError: (msg: string | null) => void;

  setView: (view: YardViewPreset) => void;
  setDensity: (d: "standard" | "dense") => void;
  setFilters: (f: Partial<YardFilters>) => void;
  setBlockFilter: (code: string) => void;

  setSelectedSlotId: (id: string | null) => void;
  setDraggingContainerId: (id: string | null) => void;

  applyServerEvent: (evt: YardUpdateEvent) => void;
  reset: () => void;
}

const defaultFilters: YardFilters = { typeId: "ALL", status: "ALL" };

export const useYardStore = create<YardState>((set) => ({
  yards: [],
  yardsLoaded: false,
  selectedYardId: null,
  layout: null,
  layoutLoading: false,
  layoutError: null,

  view: "top",
  density: "standard",
  filters: defaultFilters,
  blockFilter: "ALL",

  selectedSlotId: null,
  draggingContainerId: null,

  setYards: (yards) => set({ yards, yardsLoaded: true }),
  setSelectedYard: (id) =>
    set({
      selectedYardId: id,
      layout: null,
      layoutError: null,
      selectedSlotId: null,
      blockFilter: "ALL",
    }),
  setLayout: (layout) => set({ layout, layoutLoading: false, layoutError: null }),
  setLayoutLoading: (layoutLoading) => set({ layoutLoading }),
  setLayoutError: (layoutError) => set({ layoutError, layoutLoading: false }),

  setView: (view) => set({ view }),
  setDensity: (density) => set({ density }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setBlockFilter: (blockFilter) => set({ blockFilter }),

  setSelectedSlotId: (selectedSlotId) => set({ selectedSlotId }),
  setDraggingContainerId: (draggingContainerId) => set({ draggingContainerId }),

  applyServerEvent: () =>
    set((s) => ({ layout: s.layout ? { ...s.layout } : s.layout })),
  reset: () =>
    set({
      yards: [],
      yardsLoaded: false,
      selectedYardId: null,
      layout: null,
      layoutLoading: false,
      layoutError: null,
      view: "top",
      density: "standard",
      filters: defaultFilters,
      blockFilter: "ALL",
      selectedSlotId: null,
      draggingContainerId: null,
    }),
}));

export function containerMatchesFilters(
  c: YardContainer | null | undefined,
  filters: YardFilters
): boolean {
  if (!c) return filters.typeId === "ALL" && filters.status === "ALL";
  if (filters.typeId !== "ALL" && c.typeId !== filters.typeId) return false;
  if (filters.status !== "ALL" && c.status !== filters.status) return false;
  return true;
}

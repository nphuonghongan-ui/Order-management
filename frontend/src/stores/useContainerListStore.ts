import { create } from "zustand";
import type { ContainerType } from "@/components/container-viewer/units";

interface ContainerListState {
  types: ContainerType[];
  loaded: boolean;
  setTypes: (types: ContainerType[]) => void;
}

export const useContainerListStore = create<ContainerListState>((set) => ({
  types: [],
  loaded: false,
  setTypes: (types) => set({ types, loaded: true }),
}));

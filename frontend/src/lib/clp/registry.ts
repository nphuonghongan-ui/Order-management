import type { ContainerTypeId } from "./types";

const CM_TO_MM = 10;

interface ContainerRegistryEntry {
  label: string;
  innerMm: { l: number; w: number; h: number };
  maxWeightKg: number;
  shellColor: string;
}

function toMm(d: { length: number; width: number; height: number }) {
  return {
    l: d.length * CM_TO_MM,
    w: d.width * CM_TO_MM,
    h: d.height * CM_TO_MM,
  };
}

export const CONTAINER_REGISTRY: Record<ContainerTypeId, ContainerRegistryEntry> = {
  "20GP": {
    label: "20' Standard (Dry)",
    innerMm: toMm({ length: 586.7, width: 233.0, height: 235.0 }),
    maxWeightKg: 30480,
    shellColor: "#8b9bb4",
  },
  "40GP": {
    label: "40' Standard (Dry)",
    innerMm: toMm({ length: 1199.8, width: 233.0, height: 235.0 }),
    maxWeightKg: 30480,
    shellColor: "#8b9bb4",
  },
  "40HC": {
    label: "40' High Cube (Dry)",
    innerMm: toMm({ length: 1199.8, width: 233.0, height: 265.5 }),
    maxWeightKg: 30480,
    shellColor: "#8b9bb4",
  },
  "45HC": {
    label: "45' High Cube (Dry)",
    innerMm: toMm({ length: 1354.2, width: 233.0, height: 265.5 }),
    maxWeightKg: 30480,
    shellColor: "#8b9bb4",
  },
};

export function getContainerEntry(typeId: ContainerTypeId) {
  return CONTAINER_REGISTRY[typeId];
}

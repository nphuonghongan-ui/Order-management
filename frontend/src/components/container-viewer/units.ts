/**
 * Shipping container types and unit helpers.
 *
 * Internal unit: millimeters (mm). The 3D scene is rendered at 1 world unit
 * per millimeter so a 40HC container (~12 000 mm long) stays at a sensible
 * camera distance without further scaling.
 */

export type ContainerTypeId = "20GP" | "40GP" | "40HC" | "45HC" | "20OT" | "40RF";

export interface ContainerType {
  typeId: ContainerTypeId;
  label: string;
  inner: { l: number; w: number; h: number };
  maxWeightKg: number;
  /** RGBA color (0..1) for the wireframe shell. */
  shellColor: string;
}

/**
 * Inner dimensions (mm) for the most common ISO shipping containers.
 * "inner" excludes wall/corner casting thickness.
 */
export const CONTAINER_TYPES: ContainerType[] = [
  {
    typeId: "20GP",
    label: "20' Standard (Dry)",
    inner: { l: 5898, w: 2352, h: 2393 },
    maxWeightKg: 28200,
    shellColor: "#8b9bb4",
  },
  {
    typeId: "40GP",
    label: "40' Standard (Dry)",
    inner: { l: 12032, w: 2352, h: 2393 },
    maxWeightKg: 26780,
    shellColor: "#8b9bb4",
  },
  {
    typeId: "40HC",
    label: "40' High Cube (Dry)",
    inner: { l: 12032, w: 2352, h: 2698 },
    maxWeightKg: 26580,
    shellColor: "#8b9bb4",
  },
  {
    typeId: "45HC",
    label: "45' High Cube (Dry)",
    inner: { l: 13556, w: 2352, h: 2698 },
    maxWeightKg: 27600,
    shellColor: "#8b9bb4",
  },
  {
    typeId: "20OT",
    label: "20' Open Top",
    inner: { l: 5898, w: 2352, h: 2393 },
    maxWeightKg: 28200,
    shellColor: "#a8a07a",
  },
  {
    typeId: "40RF",
    label: "40' Reefer",
    inner: { l: 11583, w: 2294, h: 2554 },
    maxWeightKg: 27380,
    shellColor: "#7a9bb4",
  },
];

export function getContainerType(typeId: ContainerTypeId): ContainerType {
  const t = CONTAINER_TYPES.find((c) => c.typeId === typeId);
  if (!t) {
    const fallback = CONTAINER_TYPES[2];
    if (!fallback) {
      throw new Error("CONTAINER_TYPES is empty");
    }
    return fallback;
  }
  return t;
}

export const MM_PER_M = 1000;

/** Format a length in mm as "1.20 m" or "850 mm" depending on size. */
export function formatMm(mm: number): string {
  if (Math.abs(mm) >= MM_PER_M) {
    return `${(mm / MM_PER_M).toFixed(2)} m`;
  }
  return `${Math.round(mm)} mm`;
}

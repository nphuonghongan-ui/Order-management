/**
 * Shipping container type definitions and unit helpers.
 *
 * Internal unit: centimetres (cm). The 3D scene is rendered at 1 world unit
 * per centimetre so a 40HC container (~1 200 cm long) stays at a sensible
 * camera distance without further scaling.
 *
 * The actual list of container types is fetched at runtime from
 * `/api/containers` (see `lib/apis/containerApi.ts`) and cached in
 * sessionStorage. This module only owns the TypeScript types and the
 * synchronous lookups used by the optimizer and the 3D scene; they read
 * from `useContainerListStore`. Call `loadContainersCached()` once before
 * the scene mounts (the ContainerViewer page does this).
 */

export type ContainerTypeId = "20GP" | "40GP" | "40HC" | "45HC";

export interface ContainerType {
  typeId: ContainerTypeId;
  label: string;
  inner: { l: number; w: number; h: number };
  maxWeightKg: number;
  /** RGBA color (0..1) for the wireframe shell. */
  shellColor: string;
  /**
   * Relative cost factor used as a tiebreaker when two container types
   * achieve the same fill ratio. Lower = cheaper. 20GP = 1.0 baseline.
   */
  costFactor: number;
}

import { useContainerListStore } from "@/stores/useContainerListStore";

function requireLoaded(): import("@/components/container-viewer/units").ContainerType[] {
  const { types } = useContainerListStore.getState();
  if (types.length === 0) {
    throw new Error(
      "Container types are not loaded. Call loadContainersCached() before accessing them.",
    );
  }
  return types;
}

export function getContainerType(typeId: ContainerTypeId): ContainerType {
  const types = requireLoaded();
  return types.find((c) => c.typeId === typeId) ?? types[0]!;
}

export function getContainerTypes(): ContainerType[] {
  return requireLoaded();
}

export const CM_PER_M = 100;

/** Format a length in cm as "1.20 m" or "85 cm" depending on size. */
export function formatCm(cm: number): string {
  if (Math.abs(cm) >= CM_PER_M) {
    return `${(cm / CM_PER_M).toFixed(2)} m`;
  }
  return `${Math.round(cm)} cm`;
}

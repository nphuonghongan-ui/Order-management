import type { ContainerTypeId, Slot, YardContainer, YardContainerStatus } from "./yardTypes";

export type YardLegendKey =
  | "IMPORT"
  | "EXPORT"
  | "IN_TRANSIT"
  | "READY_FOR_PICKUP"
  | "EMPTY"
  | "MAINTENANCE"
  | "RESERVED_SLOT";

export interface YardLegendEntry {
  key: YardLegendKey;
  label: string;
  color: string;
}

export const YARD_HEX = {
  ground: "#f3f4f6",
  gridSurface: "#fafbfc",
  emptySlot: "#e5e7eb",
  emptySlotBorder: "#e5e7eb",
  blockedSlot: "#cbd5e1",
  label: "#475569",
  labelMuted: "#94a3b8",
  rowLabel: "#64748b",
  colLabel: "#94a3b8",
  selectedRing: "#0c56d0",
  hoverRing: "#94a3b8",
  primary: "#003d9b",
  primaryLight: "#0052cc",
  destructive: "#ba1a1a",
} as const;

export const LEGEND_HEX: Record<YardLegendKey, string> = {
  IMPORT: "#2563eb",
  EXPORT: "#22c55e",
  IN_TRANSIT: "#f59e0b",
  READY_FOR_PICKUP: "#a855f7",
  EMPTY: "#e5e7eb",
  MAINTENANCE: "#ef4444",
  RESERVED_SLOT: "#1f2937",
};

export const YARD_LEGEND: YardLegendEntry[] = [
  { key: "IMPORT", label: "Import", color: LEGEND_HEX.IMPORT },
  { key: "EXPORT", label: "Export", color: LEGEND_HEX.EXPORT },
  { key: "IN_TRANSIT", label: "In Transit", color: LEGEND_HEX.IN_TRANSIT },
  {
    key: "READY_FOR_PICKUP",
    label: "Ready for Pickup",
    color: LEGEND_HEX.READY_FOR_PICKUP,
  },
  { key: "EMPTY", label: "Empty", color: LEGEND_HEX.EMPTY },
  { key: "MAINTENANCE", label: "Maintenance", color: LEGEND_HEX.MAINTENANCE },
  { key: "RESERVED_SLOT", label: "Reserved", color: LEGEND_HEX.RESERVED_SLOT },
];

export const CONTAINER_SHELL_HEX: Record<ContainerTypeId, string> = {
  "20GP": "#8b9bb4",
  "40GP": "#6b7d96",
  "40HC": "#5a6e87",
  "45HC": "#4a5e76",
};

export function shellFor(typeId: ContainerTypeId): string {
  return CONTAINER_SHELL_HEX[typeId] ?? "#8b9bb4";
}

export function statusToLegendKey(
  status: YardContainerStatus | "ALL"
): YardLegendKey {
  switch (status) {
    case "IN_YARD":
      return "IMPORT";
    case "GROUNDED":
      return "EXPORT";
    case "LOADED":
      return "IN_TRANSIT";
    case "OUT_GATED":
      return "READY_FOR_PICKUP";
    case "RESERVED":
      return "MAINTENANCE";
    case "ALL":
    default:
      return "EMPTY";
  }
}

export function legendKeyToStatus(
  key: YardLegendKey
): YardContainerStatus | null {
  switch (key) {
    case "IMPORT":
      return "IN_YARD";
    case "EXPORT":
      return "GROUNDED";
    case "IN_TRANSIT":
      return "LOADED";
    case "READY_FOR_PICKUP":
      return "OUT_GATED";
    case "MAINTENANCE":
      return "RESERVED";
    case "EMPTY":
    case "RESERVED_SLOT":
    default:
      return null;
  }
}

export function slotColor(
  slot: Slot,
  container: YardContainer | null | undefined
): string {
  if (slot.isReserved && !container) return LEGEND_HEX.RESERVED_SLOT;
  if (!container) return YARD_HEX.emptySlot;
  return LEGEND_HEX[statusToLegendKey(container.status)];
}

export function statusFor(status: YardContainerStatus | "ALL"): string {
  if (status === "ALL") return YARD_HEX.labelMuted;
  return LEGEND_HEX[statusToLegendKey(status)];
}

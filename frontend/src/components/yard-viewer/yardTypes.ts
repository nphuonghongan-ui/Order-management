export type YardContainerStatus =
  | "IN_YARD"
  | "GROUNDED"
  | "LOADED"
  | "OUT_GATED"
  | "RESERVED";

export type ContainerTypeId = "20GP" | "40GP" | "40HC" | "45HC";

export interface YardBlock {
  code: string;
  label: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export interface Yard {
  _id: string;
  customerCustId: string;
  name: string;
  code: string;
  totalRows: number;
  totalCols: number;
  defaultMaxTier: number;
  blocks: YardBlock[];
  createdAt?: string;
  updatedAt?: string;
}

export interface YardContainer {
  _id: string;
  customerCustId: string;
  containerNo: string;
  typeId: ContainerTypeId;
  status: YardContainerStatus;
  ownerName: string;
  grossWeightKg: number;
  sealNo: string;
  eta: string | null;
  placedAt: string | null;
  currentSlotId: string | null;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  _id: string;
  customerCustId: string;
  yardId: string;
  blockCode: string;
  row: number;
  col: number;
  tier: number;
  maxTier: number;
  yardContainerId: string | null;
  isReserved: boolean;
  container?: YardContainer | null;
}

export interface YardLayoutStats {
  totalSlots: number;
  occupied: number;
  empty: number;
  stacked: number;
  occupancyPct: number;
}

export interface YardLayout {
  yard: Yard;
  slots: Slot[];
  stats: YardLayoutStats;
}

export type YardViewPreset = "top" | "iso" | "front";

export interface YardFilters {
  typeId: ContainerTypeId | "ALL";
  status: YardContainerStatus | "ALL";
}

export interface YardUpdateEvent {
  kind:
    | "container.moved"
    | "container.released"
    | "container.added"
    | "container.updated"
    | "slot.reserved";
  yardId?: string | null;
  slotId?: string;
  containerId?: string;
  reserved?: boolean;
  customerCustId?: string;
}

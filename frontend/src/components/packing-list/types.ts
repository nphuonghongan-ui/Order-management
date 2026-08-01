import type { Mode } from "@/components/po/types";

/** 1 m³ = 1 000 000 cm³. l/w/h must be in cm. */
const CM3_PER_M3 = 1_000_000;

export const calcCbm = (
  l: number,
  w: number,
  h: number,
  qty: number
): number => (l * w * h * qty) / CM3_PER_M3;

export type AvailableLine = {
  _id: string;
  poNum: string;
  orderLine: number;
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
  partNum: string;
  // Remaining quantity to pack (mutates server-side on PackingList submit/delete).
  sellingQuantity: number;
  packedQty: number;
  quantityPerCont: number;
  unitPrice: number;
  total: number;
  exWorkDate: string | null;
  length: number;
  width: number;
  height: number;
  pendingManufactureUpdate?: boolean;
  pendingManufactureUpdateAt?: string | null;
  pendingManufactureUpdateQtyPerCont?: number | null;
};

export interface PickedItem {
  lineId: string;
  poNum: string;
  partNum: string;
  shipToNum: string;
  mode: Mode;
  qty: number;
  unitPrice: number;
  length: number;
  width: number;
  height: number;
  weightKg: number;
  cbm: number;
  currentSellingQty?: number;
  quantityPerCont?: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  contact: string;
  email: string;
}

export interface DeliveryInfo {
  name: string;
  address: string;
  shipDate: string;
  notes: string;
}

export interface PackingListRecord {
  _id: string;
  plNumber: string;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  items: PickedItem[];
  itemsCount: number;
  total: number;
  createdAt: string;
  // easy-cargo sync state
  easycargoShipmentId: string | null;
  easycargoShipmentUrl: string | null;
  easycargoSentAt: string | null;
  isUpdated: boolean;
  isShipmentCreated: boolean;
  updatedAt?: string;
}

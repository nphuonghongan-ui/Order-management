import type { Mode } from "@/components/po/types";

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
}

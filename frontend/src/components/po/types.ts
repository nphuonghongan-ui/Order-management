export type Mode = "SEA" | "AIR" | "ROAD" | "RAIL";

export interface POHeader {
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
}

export interface LineItem {
  _id: string;
  customerCustID: string;
  poNum: string;
  orderLine: string;
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
  partNum: string;
  sellingQuantity: string;
  unitPrice: string;
  quantityPerCont: string;
  exWorkDate?: string | null;
}

export type FieldError = Partial<Record<keyof LineItem, string>>;

export interface ManufactureOrderDtl {
  orderLine: number;
  partNum: string;
  sellingQuantity: number;
}

export interface ManufactureItem {
  _id: string;
  customerCustId: string;
  poNum: string;
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
  orderDtl: ManufactureOrderDtl;
  unitPrice: number;
  total: number;
  quantityPerCont: number;
  exWorkDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export type Mode = "SEA" | "AIR" | "ROAD" | "RAIL";

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
}

export type FieldError = Partial<Record<keyof LineItem, string>>;
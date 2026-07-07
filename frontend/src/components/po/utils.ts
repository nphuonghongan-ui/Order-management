import type { FieldError, LineItem } from "./types";

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const calcTotal = (qty: string, price: string) =>
  (parseFloat(qty) || 0) * (parseFloat(price) || 0);

export function genPONum() {
  const n = Math.floor(6400 + Math.random() * 100);
  return `POSRS0${n}`;
}

export function uniquePONum(existing: string[]): string {
  let p = genPONum();
  while (existing.includes(p)) p = genPONum();
  return p;
}

export const newLineId = () => crypto.randomUUID();

export function emptyLine(customerCustID = "", poNum = "", orderLine = ""): LineItem {
  return {
    _id: newLineId(),
    customerCustID,
    poNum,
    orderLine,
    shipToNum: "",
    needByDate: "",
    requestDate: "",
    mode: "SEA",
    partNum: "",
    sellingQuantity: "",
    unitPrice: "",
    quantityPerCont: "",
  };
}

export function validateItem(item: LineItem): FieldError {
  const err: FieldError = {};
  if (!item.shipToNum.trim()) err.shipToNum = "Required";
  if (!item.partNum.trim()) err.partNum = "Required";
  if (!item.needByDate) err.needByDate = "Required";
  if (!item.requestDate) err.requestDate = "Required";
  if (!item.sellingQuantity || parseFloat(item.sellingQuantity) < 1)
    err.sellingQuantity = "Min 1";
  if (item.unitPrice === "" || parseFloat(item.unitPrice) < 0)
    err.unitPrice = "Required";
  if (!item.quantityPerCont || parseFloat(item.quantityPerCont) < 1)
    err.quantityPerCont = "Min 1";
  return err;
}
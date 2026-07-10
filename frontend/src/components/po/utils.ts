import type { FieldError, LineItem, POHeader } from "./types";

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const calcTotal = (qty: string, price: string) =>
  (parseFloat(qty) || 0) * (parseFloat(price) || 0);

export const calcContainers = (sellingQuantity: number, quantityPerCont: number): number => {
  if (quantityPerCont <= 0) return 0;
  return Math.floor(sellingQuantity / quantityPerCont);
};

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
  if (!item.partNum.trim()) err.partNum = "Required";
  if (!item.orderLine || parseInt(item.orderLine, 10) < 1)
    err.orderLine = "Min 1";
  if (!item.sellingQuantity || parseFloat(item.sellingQuantity) < 1)
    err.sellingQuantity = "Min 1";
  if (item.unitPrice === "" || parseFloat(item.unitPrice) < 0)
    err.unitPrice = "Required";
  if (!item.quantityPerCont || parseFloat(item.quantityPerCont) < 1)
    err.quantityPerCont = "Min 1";
  return err;
}

export function validateHeader(h: POHeader): FieldError {
  const err: FieldError = {};
  if (!h.shipToNum.trim()) err.shipToNum = "Required";
  if (!h.needByDate) err.needByDate = "Required";
  if (!h.requestDate) err.requestDate = "Required";
  return err;
}
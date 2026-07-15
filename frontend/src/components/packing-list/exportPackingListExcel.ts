import * as XLSX from "xlsx";
import type { PackingListRecord } from "./types";

const fmtCurrency = (n: number) =>
  Number.isFinite(n) ? n : 0;

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const colWidths = [
  { wch: 22 },
  { wch: 16 },
  { wch: 10 },
  { wch: 14 },
  { wch: 10 },
  { wch: 14 },
  { wch: 14 },
];

export async function exportPackingListToExcel(record: PackingListRecord) {
  const grouped = (() => {
    const map = new Map<string, typeof record.items>();
    for (const it of record.items) {
      const arr = map.get(it.poNum) ?? [];
      arr.push(it);
      map.set(it.poNum, arr);
    }
    return [...map.entries()].map(([poNum, items]) => ({
      poNum,
      items,
      subTotal: items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    }));
  })();

  const aoa: (string | number)[][] = [];

  aoa.push(["PACKING LIST"]);
  aoa.push(["PL Number", record.plNumber, "", "Generated", formatDate(record.createdAt)]);
  aoa.push([]);

  aoa.push(["CUSTOMER"]);
  aoa.push(["Name", record.customer.name, "", "Contact", record.customer.contact]);
  aoa.push(["Email", record.customer.email]);
  aoa.push(["Address", record.customer.address]);
  aoa.push([]);

  aoa.push(["DELIVERY"]);
  aoa.push([
    "Recipient",
    record.delivery.name,
    "",
    "Expected Date",
    formatDate(record.delivery.shipDate),
  ]);
  aoa.push(["Address", record.delivery.address]);
  if (record.delivery.notes) {
    aoa.push(["Notes", record.delivery.notes]);
  }
  aoa.push([]);

  aoa.push(["ITEMS"]);
  aoa.push(["PO", "Part Num", "Mode", "Ship To", "Qty", "Unit Price", "Amount"]);

  for (const group of grouped) {
    aoa.push([`PO: ${group.poNum}`]);
    for (const it of group.items) {
      aoa.push([
        group.poNum,
        it.partNum,
        it.mode,
        it.shipToNum,
        it.qty,
        fmtCurrency(it.unitPrice),
        fmtCurrency(it.qty * it.unitPrice),
      ]);
    }
    aoa.push([`Subtotal (${group.poNum})`, "", "", "", "", "", fmtCurrency(group.subTotal)]);
  }
  aoa.push([]);
  aoa.push(["GRAND TOTAL", "", "", "", "", "", fmtCurrency(record.total)]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = colWidths;
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Packing List");

  XLSX.writeFile(wb, `packing-list-${record.plNumber}.xlsx`);
}

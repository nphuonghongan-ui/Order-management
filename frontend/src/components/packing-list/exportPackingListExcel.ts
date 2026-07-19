import * as XLSX from "xlsx";
import type { PackingListRecord } from "./types";
import { calcContainersNeeded } from "@/components/po/utils";

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
  { wch: 4 },
  { wch: 10 },
  { wch: 12 },
  { wch: 20 },
  { wch: 10 },
  { wch: 28 },
  { wch: 14 },
];

export async function exportPackingListToExcel(
  record: PackingListRecord,
  partNumToDim: Map<string, { length: number; width: number; height: number }>
) {
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
  aoa.push([
    "NO",
    "NO OF CTN",
    "QTY PER CTN",
    "PROD NO",
    "QTY (PCS)",
    "L × W × H",
    "CBM",
  ]);

  let no = 0;
  for (const group of grouped) {
    aoa.push([`PO: ${group.poNum}`]);
    for (const it of group.items) {
      no += 1;
      const dim = partNumToDim.get(it.partNum);
      const hasDim = dim && (dim.length > 0 || dim.width > 0 || dim.height > 0);
      const l = dim?.length ?? 0;
      const w = dim?.width ?? 0;
      const h = dim?.height ?? 0;
      const cbm = hasDim ? l * w * h * it.qty : 0;
      const qpc = it.quantityPerCont ?? 0;
      const ctn = qpc > 0 ? calcContainersNeeded(it.qty, qpc) : 0;
      aoa.push([
        no,
        qpc > 0 ? ctn : "—",
        qpc > 0 ? qpc : "—",
        it.partNum,
        it.qty,
        hasDim ? `${l} × ${w} × ${h}` : "—",
        hasDim ? cbm : "—",
      ]);
    }
  }
  aoa.push([]);

  const totalCtn = record.items.reduce((s, it) => {
    const qpc = it.quantityPerCont ?? 0;
    return s + (qpc > 0 ? calcContainersNeeded(it.qty, qpc) : 0);
  }, 0);
  const totalQty = record.items.reduce((s, it) => s + it.qty, 0);
  const totalCbm = record.items.reduce((s, it) => {
    const dim = partNumToDim.get(it.partNum);
    if (!dim) return s;
    return s + dim.length * dim.width * dim.height * it.qty;
  }, 0);

  aoa.push(["Total NO OF CTN", "", "", "", "", "", totalCtn]);
  aoa.push(["Total QTY (PCS)", "", "", "", "", "", totalQty]);
  aoa.push(["Total CBM", "", "", "", "", "", totalCbm]);
  aoa.push(["Grand Total", "", "", "", "", "", fmtCurrency(record.total)]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = colWidths;
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Packing List");

  XLSX.writeFile(wb, `packing-list-${record.plNumber}.xlsx`);
}

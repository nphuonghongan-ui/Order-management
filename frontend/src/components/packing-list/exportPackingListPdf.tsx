import { pdf } from "@react-pdf/renderer";
import { PackingListDocument } from "./PackingListPDF";
import type { PackingListRecord } from "./types";

export async function exportPackingListToPDF(record: PackingListRecord) {
  const blob = await pdf(
    <PackingListDocument record={record} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `packing-list-${record.plNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import type { PackingListRecord } from "./types";
import { exportPackingListToPDF } from "./exportPackingListPdf";
import { exportPackingListToExcel } from "./exportPackingListExcel";

const isAxiosError = (
  e: unknown
): e is { response?: { data?: { message?: string } }; message: string } => {
  return typeof e === "object" && e !== null && "message" in e;
};

export function ExportButtons({ record }: { record: PackingListRecord }) {
  const handle = (fn: () => Promise<void> | void, errorLabel: string) =>
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await fn();
      } catch (err) {
        toast.error(
          isAxiosError(err)
            ? err.response?.data?.message || err.message
            : `Failed to export ${errorLabel}`
        );
      }
    };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={handle(() => exportPackingListToPDF(record), "PDF")}
        className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        title="Export PDF"
        aria-label={`Export ${record.plNumber} as PDF`}
      >
        <FileText size={16} />
      </button>
      <button
        type="button"
        onClick={handle(() => exportPackingListToExcel(record), "Excel")}
        className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        title="Export Excel"
        aria-label={`Export ${record.plNumber} as Excel`}
      >
        <FileSpreadsheet size={16} />
      </button>
    </div>
  );
}

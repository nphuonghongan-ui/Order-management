import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PackingListRecord } from "./types";
import { exportPackingListToPDF } from "./exportPackingListPdf";
import { exportPackingListToExcel } from "./exportPackingListExcel";
import { getPartNumDimensions } from "./exportEnrichment";

const isAxiosError = (
  e: unknown
): e is { response?: { data?: { message?: string } }; message: string } => {
  return typeof e === "object" && e !== null && "message" in e;
};

export function ExportButtons({ record }: { record: PackingListRecord }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handlePdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingPdf(true);
    try {
      const dimMap = await getPartNumDimensions();
      await exportPackingListToPDF(record, dimMap);
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Failed to export PDF"
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExcel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingExcel(true);
    try {
      const dimMap = await getPartNumDimensions();
      await exportPackingListToExcel(record, dimMap);
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Failed to export Excel"
      );
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={handlePdf}
        disabled={loadingPdf}
        className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
        title="Export PDF"
        aria-label={`Export ${record.plNumber} as PDF`}
      >
        {loadingPdf ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
      </button>
      <button
        type="button"
        onClick={handleExcel}
        disabled={loadingExcel}
        className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
        title="Export Excel"
        aria-label={`Export ${record.plNumber} as Excel`}
      >
        {loadingExcel ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={16} />
        )}
      </button>
    </div>
  );
}

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  importPartNums,
  type ImportPartNumError,
  type ImportPartNumItem,
  type ImportPartNumResponse,
  type PartNumOption,
} from "@/lib/apis/partNumApi";
import { cn } from "@/lib/utils/utils";

interface ImportPartNumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (response: ImportPartNumResponse) => void;
}

interface ParsedRow {
  row: number;
  partNum: string;
  no: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  weightKg: number | null;
  /** Per-cell error messages, keyed by column. */
  cellErrors: Record<string, string>;
  /** Whether the row has any cell-level errors. */
  invalid: boolean;
}

const TEMPLATE_HEADERS = [
  "No.",
  "OrderDtl#PartNum",
  "Dimension length",
  "Dimension width",
  "Dimension height",
  "Weight (kg)",
  "Quantity per cc",
  "CBM",
];

const ACCEPTED_EXT = [".xlsx", ".xls", ".csv"];

const toNumberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
};

const toIntOrNull = (v: unknown): number | null => {
  const n = toNumberOrNull(v);
  if (n == null) return null;
  if (!Number.isInteger(n)) return null;
  return n;
};

const toStrOrEmpty = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v).trim();

const normalizeHeader = (s: string): string =>
  s.toLowerCase().replace(/[\s_#]+/g, "").replace(/[^a-z0-9]/g, "");

const resolveColumn = (
  headers: string[],
  ...candidates: string[]
): number => {
  const normalized = headers.map(normalizeHeader);
  for (const cand of candidates) {
    const norm = normalizeHeader(cand);
    const idx = normalized.indexOf(norm);
    if (idx !== -1) return idx;
  }
  return -1;
};

const findHeaderRow = (sheet: XLSX.WorkSheet): string[] | null => {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  const maxScan = Math.min(range.s.r + 10, range.e.r);
  for (let r = range.s.r; r <= maxScan; r += 1) {
    const row: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      row.push(toStrOrEmpty(cell?.v));
    }
    const norm = row.map(normalizeHeader);
    if (
      norm.includes(normalizeHeader("OrderDtl#PartNum")) ||
      norm.includes("partnum") ||
      (norm.includes("dimensionlen") && norm.includes("dimensionwid"))
    ) {
      return row;
    }
  }
  return null;
};

const parseSheet = (sheet: XLSX.WorkSheet): ParsedRow[] => {
  const headerRow = findHeaderRow(sheet);
  if (!headerRow) return [];

  const idxPartNum = resolveColumn(headerRow, "OrderDtl#PartNum", "PartNum", "Part#");
  const idxNo = resolveColumn(headerRow, "No.", "No", "Number");
  const idxLen = resolveColumn(headerRow, "Dimension len", "Dimension length", "Length");
  const idxWid = resolveColumn(headerRow, "Dimension wid", "Dimension width", "Width");
  const idxHe = resolveColumn(headerRow, "Dimension he", "Dimension height", "Height", "Dimension hi");
  const idxWeight = resolveColumn(headerRow, "Weight", "WeightKg", "Weight (kg)");

  if (idxPartNum === -1) return [];

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
  });
  const startRow = aoa.findIndex(
    (r) => Array.isArray(r) && r.some((c) => toStrOrEmpty(c) !== "")
  );
  if (startRow === -1) return [];

  const rows = aoa.slice(startRow);
  const out: ParsedRow[] = [];
  rows.forEach((rowArr, idx) => {
    if (!Array.isArray(rowArr)) return;
    const cells = rowArr.map((c) => (c == null ? "" : String(c)));
    if (cells.every((c) => c.trim() === "")) return;
    const partNum = toStrOrEmpty(rowArr[idxPartNum]).toUpperCase();
    const noRaw = idxNo !== -1 ? rowArr[idxNo] : null;
    const lengthRaw = idxLen !== -1 ? rowArr[idxLen] : null;
    const widthRaw = idxWid !== -1 ? rowArr[idxWid] : null;
    const heightRaw = idxHe !== -1 ? rowArr[idxHe] : null;
    const weightRaw = idxWeight !== -1 ? rowArr[idxWeight] : null;

    const no = toIntOrNull(noRaw);
    const length = toNumberOrNull(lengthRaw);
    const width = toNumberOrNull(widthRaw);
    const height = toNumberOrNull(heightRaw);
    const weightKg = toNumberOrNull(weightRaw);

    const cellErrors: Record<string, string> = {};
    if (!partNum) cellErrors.partNum = "Required";
    if (length == null || length < 0) cellErrors.length = "Required (≥ 0)";
    if (width == null || width < 0) cellErrors.width = "Required (≥ 0)";
    if (height == null || height < 0) cellErrors.height = "Required (≥ 0)";
    if (weightKg == null || weightKg < 0) cellErrors.weightKg = "Required (≥ 0)";
    if (no != null && no < 1) cellErrors.no = "Min 1";

    out.push({
      row: idx + 1,
      partNum,
      no,
      length,
      width,
      height,
      weightKg,
      cellErrors,
      invalid: Object.keys(cellErrors).length > 0,
    });
  });
  return out;
};

const downloadTemplate = () => {
  const aoa: (string | number)[][] = [
    TEMPLATE_HEADERS,
    [1, "RMS120.1", 5, 5, 5, 0.5, 12, 125],
    [2, "RMS121.1", 3, 6, 6, 0.4, 12, 108],
    [3, "XMAFL040", 6, 4, 5, 0.8, 1, 120],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Part Numbers");
  XLSX.writeFile(wb, "part-numbers-template.xlsx");
};

export default function ImportPartNumDialog({
  open,
  onOpenChange,
  onImported,
}: ImportPartNumDialogProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportPartNumResponse | null>(null);

  const reset = () => {
    setFileName(null);
    setRows([]);
    setParseError(null);
    setResult(null);
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setParseError(null);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        setParseError("The file contains no readable sheet");
        setRows([]);
        return;
      }
      const parsed = parseSheet(sheet);
      if (parsed.length === 0) {
        setParseError(
          "Could not find a header row with column 'OrderDtl#PartNum' (or PartNum)."
        );
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Failed to read the file"
      );
      setRows([]);
    } finally {
      e.target.value = "";
    }
  };

  const validRows = rows.filter((r) => !r.invalid);
  const invalidCount = rows.length - validRows.length;

  const buildPayload = (): ImportPartNumItem[] =>
    validRows.map((r) => ({
      no: r.no ?? undefined,
      partNum: r.partNum,
      dimension: {
        length: r.length ?? 0,
        width: r.width ?? 0,
        height: r.height ?? 0,
      },
      weightKg: r.weightKg ?? 0,
    }));

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setSubmitting(true);
    try {
      const res = await importPartNums(buildPayload());
      if (sessionStorage.getItem("partNums") !== null) {
        sessionStorage.removeItem("partNums");
      }
      setResult(res);
      onImported(res);
      const summary = `${res.createdCount} imported, ${res.skippedCount} skipped`;
      if (res.createdCount > 0) toast.success(summary);
      else toast.warning(summary);
    } catch (err) {
      const message =
        (typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { message?: string } } })
              .response?.data?.message
          : null) ?? "Import failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    if (submitting) return;
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const previewRows = rows.slice(0, 150);
  const hasMoreRows = rows.length > previewRows.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-3xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Part Numbers from Excel</DialogTitle>
          <DialogDescription>
            Upload a .xlsx, .xls, or .csv file. The columns{" "}
            <span className="font-mono">OrderDtl#PartNum</span>,{" "}
            <span className="font-mono">Dimension len/wid/he</span> (cm) and{" "}
            <span className="font-mono">Weight</span> (kg) are required. The{" "}
            <span className="font-mono">No.</span>,{" "}
            <span className="font-mono">Quantity per cc</span>, and{" "}
            <span className="font-mono">CBM</span> columns are read but ignored
            (sequence is auto-assigned).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept={ACCEPTED_EXT.join(",")}
                onChange={handleFile}
                disabled={submitting}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium border border-border bg-card hover:bg-muted transition-colors",
                  submitting && "opacity-50 pointer-events-none"
                )}
              >
                <Upload size={14} />
                Choose file
              </span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              disabled={submitting}
            >
              <Download size={14} />
              Download template
            </Button>
            {fileName && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileSpreadsheet size={12} />
                {fileName}
                <button
                  type="button"
                  onClick={reset}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear file"
                  disabled={submitting}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {parseError && (
            <div
              role="alert"
              className="flex items-start gap-2 px-3 py-2 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive"
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}

          {rows.length > 0 && (
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">
                Previewing {previewRows.length} of {rows.length} row
                {rows.length !== 1 ? "s" : ""}
                {invalidCount > 0 && (
                  <span className="text-destructive ml-2">
                    · {invalidCount} row{invalidCount !== 1 ? "s" : ""} with
                    errors (will be skipped)
                  </span>
                )}
              </div>
              <div className="border border-border rounded-md overflow-auto flex-1 min-h-0 bg-card">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        Row
                      </th>
                      <th className="text-left py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        No.
                      </th>
                      <th className="text-left py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        Part Number
                      </th>
                      <th className="text-right py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        L (cm)
                      </th>
                      <th className="text-right py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        W (cm)
                      </th>
                      <th className="text-right py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        H (cm)
                      </th>
                      <th className="text-right py-2 px-2 font-semibold uppercase tracking-wide text-muted-foreground">
                        Wt (kg)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r) => (
                      <tr
                        key={r.row}
                        className={cn(
                          "border-t border-border",
                          r.invalid && "bg-destructive/5"
                        )}
                      >
                        <td className="py-1.5 px-2 text-muted-foreground font-mono">
                          {r.row}
                        </td>
                        <td className="py-1.5 px-2 font-mono">
                          {r.no ?? "—"}
                          {r.cellErrors.no && (
                            <div className="text-destructive text-[10px]">
                              {r.cellErrors.no}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-2 font-mono font-semibold">
                          {r.partNum || (
                            <span className="text-destructive">
                              {r.cellErrors.partNum ?? "missing"}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {r.length ?? (
                            <span className="text-destructive">
                              {r.cellErrors.length ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {r.width ?? (
                            <span className="text-destructive">
                              {r.cellErrors.width ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {r.height ?? (
                            <span className="text-destructive">
                              {r.cellErrors.height ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {r.weightKg ?? (
                            <span className="text-destructive">
                              {r.cellErrors.weightKg ?? "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMoreRows && (
                <p className="text-[10px] text-muted-foreground">
                  Showing first {previewRows.length} rows. All {rows.length}{" "}
                  rows will be submitted.
                </p>
              )}
            </div>
          )}

          {result && (
            <div
              role="status"
              className={cn(
                "flex flex-col gap-2 px-3 py-2 rounded-md border text-xs",
                result.createdCount > 0
                  ? "border-primary/40 bg-primary/5"
                  : "border-amber-500/40 bg-amber-50"
              )}
            >
              <div className="flex items-center gap-2 font-semibold">
                {result.createdCount > 0 ? (
                  <CheckCircle2 size={14} className="text-primary" />
                ) : (
                  <AlertCircle size={14} className="text-amber-600" />
                )}
                <span>
                  {result.createdCount} row
                  {result.createdCount !== 1 ? "s" : ""} imported ·{" "}
                  {result.skippedCount} skipped
                </span>
              </div>
              {result.errors.length > 0 && (
                <ul className="list-disc pl-5 text-muted-foreground">
                  {result.errors.slice(0, 10).map((e: ImportPartNumError, i) => (
                    <li key={i}>
                      Row {e.row}
                      {e.partNum ? ` "${e.partNum}"` : ""}: {e.message}
                    </li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="list-none italic">
                      …and {result.errors.length - 10} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={submitting}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={submitting || validRows.length === 0}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {submitting
                ? "Importing…"
                : `Import ${validRows.length} row${validRows.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Loader2,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listLineItems } from "@/lib/lineItemApi";
import { listPartNums } from "@/lib/partNumApi";
import { calcContainers, fmt } from "@/components/po/utils";
import {
  currencyCell,
  exWorkDateCell,
  formatDisplay,
  formatNumber,
  modePill,
  monoCell,
  partNumCell,
} from "@/components/po/lineItemColumns";
import type { ManufactureItem } from "@/components/po/types";
import { useAuthStore } from "@/stores/authStore";
import { NotifyManufactureDialog } from "@/components/notification/NotifyManufactureDialog";
import type { AvailableLine, PickedItem } from "./types";
import DataTable, { type Column } from "@/components/DataTable";

const toAvailableLine = (
  it: ManufactureItem,
  dimMap: Map<string, { length: number; width: number; height: number }>
): AvailableLine => {
  const dim = dimMap.get(it.orderDtl.partNum) ?? {
    length: 0,
    width: 0,
    height: 0,
  };
  return {
    _id: it._id,
    poNum: it.poNum,
    orderLine: it.orderDtl.orderLine,
    shipToNum: it.shipToNum,
    needByDate: it.needByDate,
    requestDate: it.requestDate,
    mode: it.mode,
    partNum: it.orderDtl.partNum,
    sellingQuantity: it.orderDtl.sellingQuantity,
    packedQty: it.packedQty ?? 0,
    quantityPerCont: it.quantityPerCont,
    unitPrice: it.unitPrice,
    total: it.total,
    exWorkDate: it.exWorkDate,
    length: dim.length,
    width: dim.width,
    height: dim.height,
  };
};

const toAvailableLineFromPicked = (p: PickedItem): AvailableLine => ({
  _id: p.lineId,
  poNum: p.poNum,
  orderLine: 0,
  shipToNum: p.shipToNum,
  needByDate: "",
  requestDate: "",
  mode: p.mode,
  partNum: p.partNum,
  sellingQuantity: p.qty,
  packedQty: 0,
  quantityPerCont: 0,
  unitPrice: p.unitPrice,
  total: p.qty * p.unitPrice,
  exWorkDate: null,
  length: p.length,
  width: p.width,
  height: p.height,
});

const toPickedItem = (l: AvailableLine, qty: number): PickedItem => ({
  lineId: l._id,
  poNum: l.poNum,
  partNum: l.partNum,
  shipToNum: l.shipToNum,
  mode: l.mode,
  qty,
  unitPrice: l.unitPrice,
  length: l.length,
  width: l.width,
  height: l.height,
  cbm: l.length * l.width * l.height * qty,
});

function QtyCell({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const maxForClamp = Math.max(min, max);
  const clamp = (n: number) => Math.min(Math.max(min, Math.floor(n)), maxForClamp);
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(clamp(value - 1));
        }}
        disabled={value <= min}
        className="p-0.5 rounded border border-border text-slate hover:text-foreground hover:bg-muted disabled:opacity-30"
        aria-label="decrease"
      >
        <Minus size={12} />
      </button>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n)) onChange(clamp(n));
        }}
        className="h-7 w-16 text-right font-mono text-xs px-1"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(clamp(value + 1));
        }}
        disabled={value >= maxForClamp}
        className="p-0.5 rounded border border-border text-slate hover:text-foreground hover:bg-muted disabled:opacity-30"
        aria-label="increase"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

async function loadPartNumsCached() {
  const cached = sessionStorage.getItem("partNums");
  if (cached) {
    try {
      return JSON.parse(cached) as Awaited<ReturnType<typeof listPartNums>>;
    } catch {
      sessionStorage.removeItem("partNums");
    }
  }
  const res = await listPartNums();
  sessionStorage.setItem("partNums", JSON.stringify(res));
  return res;
}

const buildColumns = (
  qtyRender: (row: AvailableLine) => ReactNode,
  qtySortValue: (row: AvailableLine) => number,
  cbmQty: (row: AvailableLine) => number
): Column<AvailableLine>[] => [
  {
    key: "poNum",
    label: "PO Number",
    sortable: true,
    mono: true,
    render: (row) => monoCell(row.poNum),
  },
  {
    key: "partNum",
    label: "Part Num",
    sortable: true,
    sortValue: (row) => row.partNum,
    render: (row) => partNumCell(row.partNum),
  },
  {
    key: "orderLine",
    label: "Order Line",
    align: "right",
    sortable: true,
    sortValue: (row) => row.orderLine,
    render: (row) => monoCell(row.orderLine),
  },
  {
    key: "sellingQuantity",
    label: "Sell Qty",
    align: "right",
    sortable: true,
    sortValue: qtySortValue,
    render: qtyRender,
  },
  {
    key: "quantityPerCont",
    label: "Qty per Cont",
    align: "right",
    sortable: true,
    sortValue: (row) => row.quantityPerCont,
    render: (row) => monoCell(formatNumber(row.quantityPerCont)),
  },
  {
    key: "noOfContainers",
    label: "No. cont",
    align: "right",
    sortable: true,
    sortValue: (row) =>
      calcContainers(row.sellingQuantity, row.quantityPerCont),
    render: (row) =>
      monoCell(
        formatNumber(calcContainers(row.sellingQuantity, row.quantityPerCont))
      ),
  },
  {
    key: "unitPrice",
    label: "Unit Price",
    align: "right",
    sortable: true,
    sortValue: (row) => row.unitPrice,
    render: (row) => currencyCell(row.unitPrice),
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    sortable: true,
    sortValue: (row) => row.total,
    render: (row) => currencyCell(row.total, { bold: true, primary: true }),
  },
  {
    key: "shipToNum",
    label: "Ship To",
    sortable: true,
    render: (row) => monoCell(row.shipToNum),
  },
  {
    key: "mode",
    label: "Mode",
    sortable: true,
    render: (row) => modePill(row.mode),
  },
  {
    key: "needByDate",
    label: "Need By",
    sortable: true,
    sortValue: (row) => row.needByDate,
    render: (row) => formatDisplay(row.needByDate),
  },
  {
    key: "requestDate",
    label: "Request",
    sortable: true,
    sortValue: (row) => row.requestDate,
    render: (row) => formatDisplay(row.requestDate),
  },
  {
    key: "exWorkDate",
    label: "ExWorkDate",
    sortable: true,
    nullsSort: "direction-aware",
    sortValue: (row) => row.exWorkDate,
    render: (row) => exWorkDateCell(row.exWorkDate),
  },
  {
    key: "length",
    label: "Length",
    align: "right",
    sortable: true,
    sortValue: (row) => row.length,
    render: (row) => monoCell(formatNumber(row.length)),
  },
  {
    key: "width",
    label: "Width",
    align: "right",
    sortable: true,
    sortValue: (row) => row.width,
    render: (row) => monoCell(formatNumber(row.width)),
  },
  {
    key: "height",
    label: "Height",
    align: "right",
    sortable: true,
    sortValue: (row) => row.height,
    render: (row) => monoCell(formatNumber(row.height)),
  },
  {
    key: "cbm",
    label: "CBM",
    align: "right",
    sortable: true,
    sortValue: cbmQty,
    render: (row) => monoCell(formatNumber(cbmQty(row))),
  },
];

interface ItemPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPicked: PickedItem[];
  onConfirm: (items: PickedItem[]) => void;
}

export function ItemPicker({
  open,
  onOpenChange,
  initialPicked,
  onConfirm,
}: ItemPickerProps) {
  const [available, setAvailable] = useState<AvailableLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localPicked, setLocalPicked] = useState<PickedItem[]>(initialPicked);
  const [leftSel, setLeftSel] = useState<Set<string>>(new Set());
  const [rightSel, setRightSel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    line: AvailableLine;
    sel: Set<string>;
  } | null>(null);
  const [qtyPrompt, setQtyPrompt] = useState<
    { targets: AvailableLine[]; value: number } | null
  >(null);
  const role = useAuthStore((s) => s.role);

  const fetchLineItemLimit = 50;

  useEffect(() => {
    if (!open) return;
    setLocalPicked(initialPicked);
    setLeftSel(new Set());
    setRightSel(new Set());
    setQ("");
    setCtxMenu(null);
    setQtyPrompt(null);
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [result, partNums] = await Promise.all([
          listLineItems({
            limit: fetchLineItemLimit,
            ready: true,
            excludePacked: true,
          }),
          loadPartNumsCached(),
        ]);
        if (cancelled) return;
        const map = new Map(
          partNums.map((p) => [p.partNum, p.dimension])
        );
        setAvailable(result.items.map((it) => toAvailableLine(it, map)));
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load line items"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, initialPicked]);

  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [ctxMenu]);

  const pickedQtyByLineId = useMemo(
    () => new Map(localPicked.map((p) => [p.lineId, p.qty])),
    [localPicked]
  );

  const remainingFor = (l: AvailableLine) =>
    Math.max(
      0,
      l.sellingQuantity - l.packedQty - (pickedQtyByLineId.get(l._id) ?? 0)
    );

  const sourceMap = useMemo(
    () => new Map(available.map((a) => [a._id, a] as const)),
    [available]
  );

  const packableLineMax = (lineId: string) => {
    const src = sourceMap.get(lineId);
    if (!src) return 0;
    return Math.max(
      0,
      src.sellingQuantity - src.packedQty
    );
  };

  const filteredAvailable = useMemo(() => {
    const rows = available.filter((l) => remainingFor(l) > 0);
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(
      (l) =>
        l.partNum.toLowerCase().includes(needle) ||
        l.poNum.toLowerCase().includes(needle) ||
        l.shipToNum.toLowerCase().includes(needle)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, pickedQtyByLineId, q]);

  const pickedAsLines = useMemo<AvailableLine[]>(() => {
    return localPicked.map((p) => {
      const found = available.find((a) => a._id === p.lineId);
      return found ?? toAvailableLineFromPicked(p);
    });
  }, [localPicked, available]);

  const pickedTotal = useMemo(
    () => localPicked.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    [localPicked]
  );

  const emptyMessage = useMemo(() => {
    if (q) return "No lines match your search";
    if (localPicked.length > 0) return "All items moved";
    return "No orders ready for packing yet";
  }, [q, localPicked.length]);

  const availableColumns = useMemo(
    () =>
      buildColumns(
        (row) => monoCell(formatNumber(remainingFor(row))),
        (row) => remainingFor(row),
        (row) => row.length * row.width * row.height * remainingFor(row)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickedQtyByLineId]
  );

  const setPickedQtyForLine = (lineId: string, nextQty: number) => {
    setLocalPicked((prev) => {
      const idx = prev.findIndex((p) => p.lineId === lineId);
      if (idx === -1) return prev;
      const src = sourceMap.get(lineId);
      const maxQty = src ? Math.max(0, src.sellingQuantity - src.packedQty) : 0;
      const clamped = Math.min(Math.max(1, Math.floor(nextQty)), maxQty || 1);
      const item = prev[idx];
      const updated: PickedItem = {
        ...item,
        qty: clamped,
        cbm: item.length * item.width * item.height * clamped,
      };
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };

  const pickedColumns = useMemo(
    () =>
      buildColumns(
        (row) => (
          <QtyCell
            value={pickedQtyByLineId.get(row._id) ?? row.sellingQuantity}
            min={1}
            max={packableLineMax(row._id)}
            onChange={(n) => setPickedQtyForLine(row._id, n)}
          />
        ),
        (row) => pickedQtyByLineId.get(row._id) ?? row.sellingQuantity,
        (row) =>
          row.length *
          row.width *
          row.height *
          (pickedQtyByLineId.get(row._id) ?? row.sellingQuantity)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickedQtyByLineId, sourceMap]
  );

  const toggleLeft = (row: AvailableLine) =>
    setLeftSel((prev) => {
      const next = new Set(prev);
      if (next.has(row._id)) next.delete(row._id);
      else next.add(row._id);
      return next;
    });

  const toggleRight = (row: AvailableLine) =>
    setRightSel((prev) => {
      const next = new Set(prev);
      if (next.has(row._id)) next.delete(row._id);
      else next.add(row._id);
      return next;
    });

  const addPickedQty = (line: AvailableLine, qty: number) => {
    const maxQty = Math.max(
      0,
      line.sellingQuantity - line.packedQty
    );
    const remaining = Math.max(
      0,
      maxQty - (pickedQtyByLineId.get(line._id) ?? 0)
    );
    if (remaining <= 0) return;
    const addQty = Math.min(Math.max(1, Math.floor(qty)), remaining);
    setLocalPicked((prev) => {
      const idx = prev.findIndex((p) => p.lineId === line._id);
      if (idx === -1) {
        return [...prev, toPickedItem(line, addQty)];
      }
      const existing = prev[idx];
      const newQty = Math.min(maxQty, existing.qty + addQty);
      const updated: PickedItem = {
        ...existing,
        qty: newQty,
        cbm: existing.length * existing.width * existing.height * newQty,
      };
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };

  const moveSelRight = () => {
    const toAdd = filteredAvailable.filter((l) => leftSel.has(l._id));
    toAdd.forEach((l) => addPickedQty(l, remainingFor(l)));
    setLeftSel(new Set());
  };

  const moveAllRight = () => {
    filteredAvailable.forEach((l) => addPickedQty(l, remainingFor(l)));
    setLeftSel(new Set());
  };

  const moveSelLeft = () => {
    setLocalPicked((prev) => prev.filter((it) => !rightSel.has(it.lineId)));
    setRightSel(new Set());
  };

  const moveAllLeft = () => {
    setLocalPicked([]);
    setLeftSel(new Set());
    setRightSel(new Set());
  };

  const handleContextMenu = (e: React.MouseEvent, row: AvailableLine) => {
    e.preventDefault();
    const nextSel = leftSel.has(row._id)
      ? new Set(leftSel)
      : new Set([row._id]);
    setLeftSel(nextSel);
    setCtxMenu({ x: e.clientX, y: e.clientY, line: row, sel: nextSel });
  };

  const promptMaxFor = (p: NonNullable<typeof qtyPrompt>) =>
    Math.min(...p.targets.map(remainingFor));

  const openQtyPromptFor = (targets: AvailableLine[]) => {
    if (targets.length === 0) return;
    setCtxMenu(null);
    const max = promptMaxFor({ targets, value: 1 });
    setQtyPrompt({ targets, value: Math.max(1, max) });
  };

  const submitQtyPrompt = () => {
    if (!qtyPrompt) return;
    qtyPrompt.targets.forEach((l) => addPickedQty(l, qtyPrompt.value));
    setQtyPrompt(null);
  };

  const handleConfirm = () => {
    onConfirm(localPicked);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full h-[85vh] sm:max-w-[95vw] flex flex-col gap-0"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <DialogTitle>Pick Items</DialogTitle>
            <DialogDescription>
              Select items on the left · use arrows to transfer · confirm when ready
            </DialogDescription>
          </div>

          <div className="flex justify-around gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm font-medium px-5 py-2 rounded-lg border">Cancel</button>
            <button type="button" onClick={handleConfirm} disabled={localPicked.length === 0}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg bg-dk-blue text-white disabled:opacity-50">
              <CheckSquare size={14} /> Confirm ({localPicked.length})
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex items-stretch gap-4 min-h-0 px-6 py-5">

          {/* Left side: Available Orders */}
          <Box
            title="Available Orders"
            count={filteredAvailable.length}
            toolbar={
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate"
                  />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search part, PO, or ship-to…"
                    className="h-8 pl-8 placeholder:opacity-70"
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2
                  size={20}
                  className="animate-spin text-slate"
                />
              </div>
            ) : loadError ? (
              <div className="flex items-center justify-center h-full px-6 text-center">
                <p className="text-sm text-destructive">{loadError}</p>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate">
                <Inbox size={24} className="opacity-40" />
                <p className="text-sm">{emptyMessage}</p>
                {role === "Sale" && !q && (
                  <NotifyManufactureDialog
                    trigger={
                      <Button type="button" variant="default" size="sm">
                        <Bell />
                        Notify Manufacture
                      </Button>
                    }
                  />
                )}
              </div>
            ) : (
              <DataTable
                columns={availableColumns}
                data={filteredAvailable}
                onRowClick={toggleLeft}
                onContextMenu={handleContextMenu}
                selectedRowIds={leftSel}
              />
            )}
          </Box>

          {/* Navigation */}
          <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0 w-12">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={moveSelRight}
              disabled={leftSel.size === 0}
              title="Move selected"
              aria-label="Move selected to packing list"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={moveAllRight}
              disabled={filteredAvailable.length === 0}
              title="Move all"
              aria-label="Move all to packing list"
            >
              <ChevronsRight size={14} />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={moveSelLeft}
              disabled={rightSel.size === 0}
              title="Remove selected"
              aria-label="Remove selected from packing list"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={moveAllLeft}
              disabled={localPicked.length === 0}
              title="Remove all"
              aria-label="Remove all from packing list"
            >
              <ChevronsLeft size={14} />
            </Button>
          </div>

          {/* Right side: Packing List */}
          <Box
            title="Packing List"
            count={localPicked.length}
            footer={
              localPicked.length > 0 ? (
                <span className="font-semibold text-primary font-mono">
                  $ {fmt(pickedTotal)}
                </span>
              ) : null
            }
          >
            {pickedAsLines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate">
                <Inbox size={24} className="opacity-40" />
                <p className="text-sm">No items selected yet</p>
              </div>
            ) : (
              <DataTable
                columns={pickedColumns}
                data={pickedAsLines}
                onRowClick={toggleRight}
                selectedRowIds={rightSel}
              />
            )}
          </Box>
        </div>

        {ctxMenu && (
          <ContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            line={ctxMenu.line}
            getRemaining={remainingFor}
            onPickQty={() =>
              openQtyPromptFor(
                available.filter((l) => ctxMenu.sel.has(l._id))
              )
            }
          />
        )}

        {qtyPrompt && (
          <Dialog
            open
            onOpenChange={(o) => {
              if (!o) setQtyPrompt(null);
            }}
          >
            <DialogContent
              showCloseButton={false}
              className="sm:max-w-sm flex flex-col gap-0"
            >
              <DialogHeader>
                <DialogTitle>Pick quantity</DialogTitle>
                <DialogDescription>
                  {qtyPrompt.targets.length === 1
                    ? `${qtyPrompt.targets[0].poNum} · ${qtyPrompt.targets[0].partNum} (remaining ${formatNumber(remainingFor(qtyPrompt.targets[0]))})`
                    : `Apply to ${qtyPrompt.targets.length} lines · per-line max varies`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-center py-4">
                <QtyCell
                  value={qtyPrompt.value}
                  min={1}
                  max={promptMaxFor(qtyPrompt)}
                  onChange={(n) =>
                    setQtyPrompt((p) =>
                      p ? { ...p, value: n } : p
                    )
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQtyPrompt(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={submitQtyPrompt}
                  disabled={
                    qtyPrompt.value < 1 ||
                    qtyPrompt.value > promptMaxFor(qtyPrompt)
                  }
                >
                  <CheckSquare size={14} /> Add to packing list
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContextMenu({
  x,
  y,
  line,
  getRemaining,
  onPickQty,
}: {
  x: number;
  y: number;
  line: AvailableLine;
  getRemaining: (l: AvailableLine) => number;
  onPickQty: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const pos = useMemo(() => {
    const W = typeof window !== "undefined" ? window.innerWidth : 1024;
    const H = typeof window !== "undefined" ? window.innerHeight : 768;
    const width = 200;
    const height = 60;
    return {
      x: Math.max(8, Math.min(x, W - width - 8)),
      y: Math.max(8, Math.min(y, H - height - 8)),
    };
  }, [x, y]);
  const remaining = getRemaining(line);
  return (
    <div
      ref={menuRef}
      style={{ left: pos.x, top: pos.y, maxHeight: "calc(100vh - 16px)" }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-[180px] rounded-lg border border-border bg-popover shadow-lg py-1 text-sm"
    >
      <button
        type="button"
        onClick={onPickQty}
        disabled={remaining <= 0}
        className="w-full text-left px-3 py-2 hover:bg-muted disabled:opacity-40 flex items-center gap-2"
      >
        <Plus size={14} /> Pick quantity…
      </button>
    </div>
  );
}

function Box({
  title,
  count,
  footer,
  toolbar,
  children,
}: {
  title: string;
  count: number;
  footer?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-xs text-slate">
          {count} order{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border border-border bg-card flex flex-col min-h-0">
        {toolbar}
        <div className="flex-1 min-h-0">{children}</div>
        {footer !== undefined && (
          <div className="px-4 py-2 border-t border-border text-xs flex items-center justify-between text-slate flex-shrink-0">
            <span>Subtotal</span>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

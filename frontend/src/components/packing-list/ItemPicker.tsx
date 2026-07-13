import { useEffect, useMemo, useState } from "react";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Loader2,
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
import { cn } from "@/lib/utils";
import { listLineItems } from "@/lib/lineItemApi";
import { fmt } from "@/components/po/utils";
import { MODE_ICONS, formatNumber } from "@/components/po/lineItemColumns";
import type { ManufactureItem } from "@/components/po/types";
import type { AvailableLine, PickedItem } from "./types";

const toAvailableLine = (it: ManufactureItem): AvailableLine => ({
  _id: it._id,
  poNum: it.poNum,
  shipToNum: it.shipToNum,
  mode: it.mode,
  partNum: it.orderDtl.partNum,
  sellingQuantity: it.orderDtl.sellingQuantity,
  unitPrice: it.unitPrice,
  total: it.total,
  needByDate: it.needByDate,
});

const toPickedItem = (l: AvailableLine): PickedItem => ({
  lineId: l._id,
  poNum: l.poNum,
  partNum: l.partNum,
  shipToNum: l.shipToNum,
  mode: l.mode,
  qty: l.sellingQuantity,
  unitPrice: l.unitPrice,
});

interface ItemPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPicked: PickedItem[];
  onConfirm: (items: PickedItem[]) => void;
}

const COL = "1fr 90px 90px 100px";

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

  const fetchLineItemLimit = 50;

  useEffect(() => {
    if (!open) return;
    setLocalPicked(initialPicked);
    setLeftSel(new Set());
    setRightSel(new Set());
    setQ("");
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listLineItems({ limit: fetchLineItemLimit });
        if (cancelled) return;
        setAvailable(result.items.map(toAvailableLine));
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

  const pickedIds = useMemo(
    () => new Set(localPicked.map((p) => p.lineId)),
    [localPicked]
  );

  const filteredAvailable = useMemo(() => {
    const rows = available.filter((l) => !pickedIds.has(l._id));
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(
      (l) =>
        l.partNum.toLowerCase().includes(needle) ||
        l.poNum.toLowerCase().includes(needle) ||
        l.shipToNum.toLowerCase().includes(needle)
    );
  }, [available, pickedIds, q]);

  const pickedTotal = useMemo(
    () => localPicked.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    [localPicked]
  );

  const toggleLeft = (id: string) =>
    setLeftSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleRight = (id: string) =>
    setRightSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const moveSelRight = () => {
    const toAdd = filteredAvailable.filter((l) => leftSel.has(l._id));
    setLocalPicked((prev) => [...prev, ...toAdd.map(toPickedItem)]);
    setLeftSel(new Set());
  };

  const moveAllRight = () => {
    setLocalPicked((prev) => [...prev, ...filteredAvailable.map(toPickedItem)]);
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

          {/* Left side: Available Line Items */}
          <Box
            title="Available Line Items"
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
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate">
                <Inbox size={24} className="opacity-40" />
                <p className="text-sm">
                  {q ? "No lines match your search" : "All items moved"}
                </p>
              </div>
            ) : (
              filteredAvailable.map((line) => {
                const sel = leftSel.has(line._id);
                const ModeIcon = MODE_ICONS[line.mode];
                return (
                  <button
                    key={line._id}
                    type="button"
                    onClick={() => toggleLeft(line._id)}
                    className={cn(
                      "grid w-full text-left items-center px-4 py-2.5 border-b border-border transition-colors",
                      sel
                        ? "bg-primary/10"
                        : "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    )}
                    style={{ gridTemplateColumns: COL }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold font-mono truncate">
                        {line.partNum}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <span className="px-1.5 py-px rounded bg-muted font-mono">
                          {line.poNum.replace(/^POSRS0?/, "#")}
                        </span>
                        <ModeIcon size={10} />
                        <span>{line.shipToNum}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm font-mono">
                      {formatNumber(line.sellingQuantity)}
                    </div>
                    <div className="text-right text-sm font-mono">
                      {fmt(line.unitPrice)}
                    </div>
                    <div className="text-right text-sm font-semibold font-mono text-primary-light">
                      {fmt(line.total)}
                    </div>
                  </button>
                );
              })
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
            {localPicked.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate">
                <Inbox size={24} className="opacity-40" />
                <p className="text-sm">No items selected yet</p>
              </div>
            ) : (
              localPicked.map((it) => {
                const sel = rightSel.has(it.lineId);
                const ModeIcon = MODE_ICONS[it.mode];
                const amount = it.qty * it.unitPrice;
                return (
                  <button
                    key={it.lineId}
                    type="button"
                    onClick={() => toggleRight(it.lineId)}
                    className={cn(
                      "grid w-full text-left items-center px-4 py-2.5 border-b border-border transition-colors",
                      sel
                        ? "bg-primary/10"
                        : "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    )}
                    style={{ gridTemplateColumns: COL }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold font-mono truncate">
                        {it.partNum}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <ModeIcon size={10} />
                        <span>{it.shipToNum}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm font-mono">
                      {formatNumber(it.qty)}
                    </div>
                    <div className="text-right text-sm font-mono">
                      {fmt(it.unitPrice)}
                    </div>
                    <div className="text-right text-sm font-semibold font-mono text-primary-light">
                      {fmt(amount)}
                    </div>
                  </button>
                );
              })
            )}
          </Box>
        </div>
      </DialogContent>
    </Dialog>
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
          {count} item{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border border-border bg-card flex flex-col min-h-0">
        {toolbar}
        <div className="grid px-4 py-2 border-b border-border text-xs font-semibold uppercase tracking-wide text-slate flex-shrink-0"
          style={{ gridTemplateColumns: COL }}>
          <span>Part / PO</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit $</span>
          <span className="text-right">Total</span>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
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

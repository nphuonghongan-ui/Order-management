import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  CircleDot,
  X,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PagePagination from "@/components/PagePagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";
import {
  listManufactureItems,
  patchManufactureItem,
} from "@/lib/manufactureApi";
import { calcContainers } from "@/components/po/utils";
import type { ManufactureItem } from "@/components/po/types";
import {
  currencyCell,
  formatDisplay,
  formatNumber,
  modePill,
  monoCell,
  partNumCell,
} from "@/components/po/lineItemColumns";

interface PendingChange {
  id: string;
  poNum: string;
  orderLine: number;
  partNum: string;
  oldExWorkDate: string | null;
  newExWorkDate: string | null;
  oldQtyPerCont: number;
  newQtyPerCont: number;
}

const toDateInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const isAxiosError = (e: unknown): e is { response?: { data?: { message?: string } }; message: string } => {
  return typeof e === "object" && e !== null && "message" in e;
};

export default function ProductionSchedule() {
  const [items, setItems] = useState<ManufactureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, PendingChange>>({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");

  const requestSeq = useRef(0);

  const loadPage = useCallback(
    async (opts: { reset: boolean; cursor?: string | null; search: string }) => {
      const seq = ++requestSeq.current;
      if (opts.reset) {
        setLoading(true);
      } else {
        setLoadingPage(true);
      }
      try {
        const result = await listManufactureItems({
          cursor: opts.reset ? null : opts.cursor ?? null,
          limit: 10,
          q: opts.search || undefined,
        });
        if (seq !== requestSeq.current) return;
        setItems(result.items);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        if (opts.reset) {
          setCursorStack([]);
        }
        setLoadError(null);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setLoadError(
          isAxiosError(err)
            ? err.response?.data?.message || err.message
            : "Failed to load items"
        );
      } finally {
        if (seq === requestSeq.current) {
          if (opts.reset) {
            setLoading(false);
          } else {
            setLoadingPage(false);
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setQ(qDraft);
    }, 300);
    return () => clearTimeout(handle);
  }, [qDraft]);

  useEffect(() => {
    loadPage({ reset: true, search: q });
  }, [q, loadPage]);

  const handlePrev = () => {
    if (cursorStack.length === 0) return;
    const next = cursorStack.slice(0, -1);
    const cursor = next.length === 0 ? null : next[next.length - 1] ?? null;
    setCursorStack(next);
    loadPage({ reset: false, cursor, search: q });
  };

  const handleNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    loadPage({ reset: false, cursor: nextCursor, search: q });
  };

  const handlePageJump = (page: number) => {
    if (page === currentPage || loadingPage) return;
    if (page < currentPage) {
      const newStack = cursorStack.slice(0, page - 1);
      const cursor = page === 1 ? null : cursorStack[page - 2] ?? null;
      setCursorStack(newStack);
      loadPage({ reset: false, cursor, search: q });
    } else if (page === currentPage + 1) {
      handleNext();
    }
  };

  const currentPage = cursorStack.length + 1;
  const visiblePageStart = Math.max(1, currentPage - 1);
  const visiblePages = [visiblePageStart, visiblePageStart + 1, visiblePageStart + 2];

  const refresh = async () => {
    const cursor =
      cursorStack.length === 0 ? null : cursorStack[cursorStack.length - 1] ?? null;
    await loadPage({ reset: false, cursor, search: q });
  };

  const updatePending = (
    item: ManufactureItem,
    field: "exWorkDate" | "qtyPerCont",
    newValue: string | null | number
  ) => {
    setPending((prev) => {
      const existing = prev[item._id];
      const newExWorkDate =
        field === "exWorkDate"
          ? (newValue as string | null)
          : (existing?.newExWorkDate ?? (item.exWorkDate ?? null));
      const newQtyPerCont =
        field === "qtyPerCont"
          ? (newValue as number)
          : (existing?.newQtyPerCont ?? item.quantityPerCont);
      const oldExWorkDate = existing?.oldExWorkDate ?? (item.exWorkDate ?? null);
      const oldQtyPerCont = existing?.oldQtyPerCont ?? item.quantityPerCont;

      if (newExWorkDate === oldExWorkDate && newQtyPerCont === oldQtyPerCont) {
        const next = { ...prev };
        delete next[item._id];
        return next;
      }

      return {
        ...prev,
        [item._id]: {
          id: item._id,
          poNum: item.poNum,
          orderLine: item.orderDtl.orderLine,
          partNum: item.orderDtl.partNum,
          oldExWorkDate,
          newExWorkDate,
          oldQtyPerCont,
          newQtyPerCont,
        },
      };
    });
    setSaveErrors((prev) => {
      if (!prev[item._id]) return prev;
      const { [item._id]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const clearPending = () => {
    setPending({});
    setSaveErrors({});
  };

  const pendingList = useMemo(() => Object.values(pending), [pending]);
  const pendingCount = pendingList.length;

  const handleConfirmSave = async () => {
    if (pendingCount === 0) return;
    setSaving(true);
    setSaveErrors({});
    const results = await Promise.allSettled(
      pendingList.map((p) =>
        patchManufactureItem(p.id, {
          exWorkDate: p.newExWorkDate,
          quantityPerCont: p.newQtyPerCont,
        })
      )
    );
    const newErrors: Record<string, string> = {};
    const updatedMap = new Map<string, ManufactureItem>();
    let successCount = 0;
    results.forEach((r, idx) => {
      const change = pendingList[idx];
      if (r.status === "fulfilled") {
        successCount += 1;
        updatedMap.set(change.id, r.value);
      } else {
        const message = isAxiosError(r.reason)
          ? r.reason.response?.data?.message || r.reason.message
          : "Update failed";
        newErrors[change.id] = message;
      }
    });

    if (updatedMap.size > 0) {
      setPending((prev) => {
        const next = { ...prev };
        updatedMap.forEach((_, id) => {
          delete next[id];
        });
        return next;
      });
      await refresh();
    }
    setSaveErrors(newErrors);

    if (successCount > 0) {
      toast.success(
        `${successCount} schedule update${successCount !== 1 ? "s" : ""} saved`
      );
    }
    if (Object.keys(newErrors).length > 0) {
      toast.error(
        `${Object.keys(newErrors).length} update(s) failed — see row indicators`
      );
    }

    setSaving(false);
    if (Object.keys(newErrors).length === 0) {
      setConfirmOpen(false);
    }
  };

  const columns: Column<ManufactureItem>[] = useMemo(
    () => [
      { key: "poNum", label: "PO Number", sortable: true, mono: true },
      {
        key: "partNum",
        label: "Part Num",
        sortable: true,
        sortValue: (row) => row.orderDtl.partNum,
        render: (row) => partNumCell(row.orderDtl.partNum),
      },
      {
        key: "orderLine",
        label: "Order Line",
        align: "right",
        sortable: true,
        sortValue: (row) => row.orderDtl.orderLine,
        render: (row) => monoCell(row.orderDtl.orderLine),
      },
      {
        key: "sellingQuantity",
        label: "Sell Qty",
        align: "right",
        sortable: true,
        sortValue: (row) => row.orderDtl.sellingQuantity,
        render: (row) => monoCell(formatNumber(row.orderDtl.sellingQuantity)),
      },
      {
        key: "quantityPerCont",
        label: "Qty per Cont",
        align: "right",
        sortable: true,
        render: (row) => {
          const isPending = !!pending[row._id];
          const hasError = !!saveErrors[row._id];
          const currentValue = isPending
            ? pending[row._id].newQtyPerCont
            : row.quantityPerCont;
          const isUnset = currentValue <= 0;

          return (
            <div className="flex items-center gap-1 justify-end">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={currentValue === 0 ? "" : currentValue}
                  placeholder="0"
                  onChange={(e) => {
                    const v =
                      e.target.value === ""
                        ? 0
                        : Math.max(0, parseInt(e.target.value, 10) || 0);
                    updatePending(row, "qtyPerCont", v);
                  }}
                  className={cn(
                    "h-8 w-[80px] font-mono text-xs text-right",
                    isUnset && "border-amber-500 ring-1 ring-amber-500/30",
                    hasError && "border-destructive ring-1 ring-destructive/30",
                    isPending && "border-primary ring-1 ring-primary/30"
                  )}
                  aria-invalid={hasError}
                />
                {isUnset && (
                  <AlertTriangle
                    size={12}
                    className="absolute -top-1.5 -left-1.5 text-amber-500 bg-card rounded-full"
                  />
                )}
                {isPending && (
                  <CircleDot
                    size={12}
                    className="absolute -top-1.5 -right-1.5 text-primary bg-card rounded-full"
                  />
                )}
              </div>
              {isPending && (
                <button
                  type="button"
                  onClick={() =>
                    updatePending(row, "qtyPerCont", row.quantityPerCont)
                  }
                  className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Discard this change"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        },
      },
      {
        key: "noOfContainers",
        label: "No. cont",
        align: "right",
        sortable: true,
        sortValue: (row) =>
          calcContainers(row.orderDtl.sellingQuantity, row.quantityPerCont),
        render: (row) => {
          const currentQty = pending[row._id]
            ? pending[row._id].newQtyPerCont
            : row.quantityPerCont;
          return monoCell(
            formatNumber(
              calcContainers(row.orderDtl.sellingQuantity, currentQty)
            )
          );
        },
      },
      {
        key: "unitPrice",
        label: "Unit Price",
        align: "right",
        sortable: true,
        render: (row) => currencyCell(row.unitPrice),
      },
      {
        key: "total",
        label: "Total",
        align: "right",
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
        render: (row) => formatDisplay(row.needByDate),
      },
      {
        key: "requestDate",
        label: "Request",
        sortable: true,
        render: (row) => formatDisplay(row.requestDate),
      },
      {
        key: "exWorkDate",
        label: "ExWorkDate",
        sortable: true,
        nullsSort: "direction-aware",
        render: (row) => {
          const isPending = !!pending[row._id];
          const hasError = !!saveErrors[row._id];
          return (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="date"
                  value={
                    isPending
                      ? toDateInput(pending[row._id].newExWorkDate)
                      : toDateInput(row.exWorkDate)
                  }
                  onChange={(e) => updatePending(row, "exWorkDate", e.target.value || null)}
                  className={cn(
                    "h-8 w-[150px] font-mono text-xs",
                    hasError && "border-destructive ring-1 ring-destructive/30",
                    isPending && "border-primary ring-1 ring-primary/30"
                  )}
                  aria-invalid={hasError}
                />
                {isPending && (
                  <CircleDot
                    size={12}
                    className="absolute -top-1.5 -right-1.5 text-primary bg-card rounded-full"
                  />
                )}
              </div>
              {isPending && (
                <button
                  type="button"
                  onClick={() => updatePending(row, "exWorkDate", row.exWorkDate ?? null)}
                  className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Discard this change"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [pending, saveErrors]
  );

  if (loading && items.length === 0) {
    return (
      <PageShell className="items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-3 gap-4">
        <ActionToolbar
          search={qDraft}
          setSearch={setQDraft}
        />
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10 mb-4"
        >
          <AlertCircle
            size={16}
            className="text-destructive flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-destructive">{loadError}</p>
            <button
              onClick={refresh}
              className="text-xs text-destructive underline self-start"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        rowClassName={(row) =>
          row.quantityPerCont <= 0 ? "bg-amber-50/50" : ""
        }
        emptyMessage={
          items.length === 0 ? (
            q ? (
              <span className="flex flex-col items-center gap-1">
                <span>No items match &ldquo;{q}&rdquo;</span>
                <span className="text-xs">Try a different PO number.</span>
              </span>
            ) : (
              <span className="flex flex-col items-center gap-1">
                <span>No line items yet</span>
                <span className="text-xs">
                  Submit a purchase order to see items here.
                </span>
              </span>
            )
          ) : (
            "No items on this page"
          )
        }
      />

      <div className="mt-3">
        <PagePagination
        disabled={loadingPage}
        loading={loadingPage}
        canGoPrev={cursorStack.length > 0}
        canGoNext={hasMore}
        onPrev={handlePrev}
        onNext={handleNext}
        onPageJump={handlePageJump}
        currentPage={currentPage}
        visiblePages={visiblePages}
      />
      </div>

      {pendingCount > 0 && (
        <div className="fixed bottom-0 inset-x-60 z-30 px-6 pb-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-card shadow-lg px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CircleDot size={16} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {pendingCount} pending change{pendingCount !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  Review and save to commit the updates
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={clearPending}
                disabled={saving}
              >
                Discard
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={saving}
              >
                <Save size={14} />
                Save changes ({pendingCount})
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={(o) => !saving && setConfirmOpen(o)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Confirm updates</DialogTitle>
            <DialogDescription>
              You are about to update {pendingCount} line item
              {pendingCount !== 1 ? "s" : ""}. These changes will be saved
              immediately.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const unsetQty = pendingList.filter(
              (p) => p.newQtyPerCont <= 0
            ).length;
            return unsetQty > 0 ? (
              <div
                role="alert"
                className="flex items-start gap-2 px-3 py-2 rounded-md border border-amber-500/40 bg-amber-50"
              >
                <AlertTriangle
                  size={14}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <span className="text-xs text-amber-700">
                  {unsetQty} item{unsetQty !== 1 ? "s" : ""} still need Qty per
                  Container. You can still save — set it later or leave as 0.
                </span>
              </div>
            ) : null;
          })()}

          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left font-bold uppercase tracking-wide py-2 px-2 text-muted-foreground">
                    PO
                  </th>
                  <th className="text-left font-bold uppercase tracking-wide py-2 px-2 text-muted-foreground">
                    Old ExWork
                  </th>
                  <th className="text-left font-bold uppercase tracking-wide py-2 px-2 text-muted-foreground">
                    New ExWork
                  </th>
                  <th className="text-right font-bold uppercase tracking-wide py-2 px-2 text-muted-foreground">
                    Old Qty/Cont
                  </th>
                  <th className="text-right font-bold uppercase tracking-wide py-2 px-2 text-muted-foreground">
                    New Qty/Cont
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-1.5 px-2 font-mono">{p.poNum}</td>
                    <td className="py-1.5 px-2 font-mono text-muted-foreground">
                      {formatDisplay(p.oldExWorkDate)}
                    </td>
                    <td
                      className={cn(
                        "py-1.5 px-2 font-mono font-semibold",
                        p.oldExWorkDate !== p.newExWorkDate
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDisplay(p.newExWorkDate)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right text-muted-foreground">
                      {formatNumber(p.oldQtyPerCont)}
                    </td>
                    <td
                      className={cn(
                        "py-1.5 px-2 font-mono text-right font-semibold",
                        p.oldQtyPerCont !== p.newQtyPerCont
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatNumber(p.newQtyPerCont)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Object.keys(saveErrors).length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 px-3 py-2 rounded-md border border-destructive/40 bg-destructive/10"
            >
              <AlertCircle size={14} className="text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-xs text-destructive">
                {Object.entries(saveErrors).map(([id, msg]) => {
                  const item = pending[id];
                  return (
                    <span key={id}>
                      {item ? `${item.poNum} / line ${item.orderLine}: ` : ""}
                      {msg}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Saving…" : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

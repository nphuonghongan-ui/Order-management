import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Hash,
  Inbox,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import PagePagination from "@/components/PagePagination";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { listLineItems } from "@/lib/lineItemApi";
import { calcContainers, fmt } from "@/components/po/utils";
import type { ManufactureItem, Mode } from "@/components/po/types";
import {
  currencyCell,
  exWorkDateCell,
  formatDisplay,
  formatNumber,
  modePill,
  monoCell,
  partNumCell,
} from "@/components/po/lineItemColumns";

const MODE_FILTERS = [
  { value: "ALL", label: "All modes" },
  { value: "SEA", label: "SEA" },
  { value: "AIR", label: "AIR" },
  { value: "ROAD", label: "ROAD" },
  { value: "RAIL", label: "RAIL" },
];

const isAxiosError = (
  e: unknown
): e is { response?: { data?: { message?: string } }; message: string } => {
  return typeof e === "object" && e !== null && "message" in e;
};

export default function MyLines() {
  const [items, setItems] = useState<ManufactureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [activeMode, setActiveMode] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<ManufactureItem | null>(null);

  const requestSeq = useRef(0);

  const loadPage = useCallback(
    async (opts: {
      reset: boolean;
      cursor?: string | null;
      search: string;
      mode?: string;
    }) => {
      const seq = ++requestSeq.current;
      if (opts.reset) {
        setLoading(true);
      } else {
        setLoadingPage(true);
      }
      try {
        const result = await listLineItems({
          cursor: opts.reset ? null : opts.cursor ?? null,
          limit: 10,
          q: opts.search || undefined,
          mode:
            opts.mode && opts.mode !== "ALL" ? (opts.mode as Mode) : null,
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
    loadPage({ reset: true, search: q, mode: activeMode });
  }, [q, activeMode, loadPage]);

  const handlePrev = () => {
    if (cursorStack.length === 0) return;
    const next = cursorStack.slice(0, -1);
    const cursor = next.length === 0 ? null : next[next.length - 1] ?? null;
    setCursorStack(next);
    loadPage({ reset: false, cursor, search: q, mode: activeMode });
  };

  const handleNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    loadPage({ reset: false, cursor: nextCursor, search: q, mode: activeMode });
  };

  const handlePageJump = (page: number) => {
    if (page === currentPage || loadingPage) return;
    if (page < currentPage) {
      const newStack = cursorStack.slice(0, page - 1);
      const cursor = page === 1 ? null : cursorStack[page - 2] ?? null;
      setCursorStack(newStack);
      loadPage({ reset: false, cursor, search: q, mode: activeMode });
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
    await loadPage({ reset: false, cursor, search: q, mode: activeMode });
  };

  // Group items by poNum, ordered by most recent createdAt desc
  const groupedByPO = useMemo(() => {
    const map = new Map<string, ManufactureItem[]>();
    for (const it of items) {
      const arr = map.get(it.poNum) ?? [];
      arr.push(it);
      map.set(it.poNum, arr);
    }
    return [...map.entries()]
      .map(([poNum, lines]) => {
        const groupCreatedAt = lines
          .map((l) => l.createdAt)
          .sort()
          .reverse()[0] ?? "";
        const subtotal = lines.reduce((s, l) => s + l.total, 0);
        return { poNum, lines, groupCreatedAt, subtotal };
      })
      .sort((a, b) => b.groupCreatedAt.localeCompare(a.groupCreatedAt));
  }, [items]);

  const totalLines = items.length;
  const totalValue = useMemo(
    () => items.reduce((s, it) => s + it.total, 0),
    [items]
  );

  const buildColumns = (): Column<ManufactureItem>[] => [
    {
      key: "partNum",
      label: "Part Num",
      sortable: false,
      render: (row) => partNumCell(row.orderDtl.partNum),
    },
    {
      key: "orderLine",
      label: "Order Line",
      align: "right",
      sortable: false,
      render: (row) => monoCell(row.orderDtl.orderLine),
    },
    {
      key: "sellingQuantity",
      label: "Sell Qty",
      align: "right",
      sortable: false,
      render: (row) => monoCell(formatNumber(row.orderDtl.sellingQuantity)),
    },
    {
      key: "quantityPerCont",
      label: "Qty per Cont",
      align: "right",
      sortable: false,
      render: (row) => monoCell(formatNumber(row.quantityPerCont)),
    },
    {
      key: "noOfContainers",
      label: "No. cont",
      align: "right",
      sortable: false,
      render: (row) =>
        monoCell(
          formatNumber(
            calcContainers(row.orderDtl.sellingQuantity, row.quantityPerCont)
          )
        ),
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      align: "right",
      sortable: false,
      render: (row) => currencyCell(row.unitPrice),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      sortable: false,
      render: (row) => currencyCell(row.total, { bold: true, primary: true }),
    },
    {
      key: "shipToNum",
      label: "Ship To",
      sortable: false,
      render: (row) => monoCell(row.shipToNum),
    },
    {
      key: "mode",
      label: "Mode",
      sortable: false,
      render: (row) => modePill(row.mode),
    },
    {
      key: "needByDate",
      label: "Need By",
      sortable: false,
      render: (row) => formatDisplay(row.needByDate),
    },
    {
      key: "requestDate",
      label: "Request",
      sortable: false,
      render: (row) => formatDisplay(row.requestDate),
    },
    {
      key: "exWorkDate",
      label: "ExWorkDate",
      sortable: false,
      render: (row) => exWorkDateCell(row.exWorkDate),
    },
    {
      key: "_action",
      label: "",
      sortable: false,
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(row);
          }}
          className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="View details"
        >
          <ChevronRight size={16} />
        </button>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <PageShell className="items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Fixed top: stats, toolbar, error */}
      <div className="shrink-0">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-border bg-card px-5 py-3.5">
            <div className="text-xs text-muted-foreground">Total Lines</div>
            <div className="text-2xl font-bold text-primary-light font-mono mt-0.5">
              {totalLines}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card px-5 py-3.5">
            <div className="text-xs text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold text-primary-light font-mono mt-0.5">
              $ {totalValue > 0 ? fmt(totalValue) : "—"}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3 gap-4">
          <ActionToolbar
            search={qDraft}
            setSearch={setQDraft}
            filters={MODE_FILTERS}
            activeFilter={activeMode}
            setActiveFilter={setActiveMode}
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
      </div>

      {/* Scrollable middle: PO groups or empty state */}
      <div className="flex-1 min-h-0 overflow-auto">
        {groupedByPO.length === 0 ? (
          <div className="rounded-lg border border-border bg-card">
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Inbox size={32} className="opacity-40" />
                {q ? (
                  <>
                    <span className="text-sm">
                      No items match &ldquo;{q}&rdquo;
                    </span>
                    <span className="text-xs">
                      Try a different PO number.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">No line items yet</span>
                    <span className="text-xs">
                      Submit a purchase order to see items here.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedByPO.map((group) => (
              <div
                key={group.poNum}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* PO group header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-md flex items-center justify-center bg-primary/10 shrink-0">
                      <Hash size={14} className="text-primary" />
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {group.poNum}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDisplay(group.groupCreatedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {group.lines.length} line{group.lines.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary font-mono">
                    $ {fmt(group.subtotal)}
                  </span>
                </div>

                {/* Nested line table */}
                <div onClick={(e) => e.stopPropagation()}>
                  <DataTable
                    columns={buildColumns()}
                    data={group.lines}
                    emptyMessage="No lines"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom: pagination */}
      <div className="shrink-0 mt-4">
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

      {/* Detail drawer */}
      <Sheet open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedItem.poNum}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-normal text-sm">
                    Line {selectedItem.orderDtl.orderLine}
                  </span>
                </SheetTitle>
                <SheetDescription>Line item details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex flex-col gap-4 text-sm">
                <DetailRow label="Part Number" value={selectedItem.orderDtl.partNum} mono />
                <DetailRow label="Ship To" value={selectedItem.shipToNum} mono />
                <DetailRow
                  label="Mode"
                  value={modePill(selectedItem.mode)}
                />
                <DetailRow label="Need By Date" value={formatDisplay(selectedItem.needByDate)} />
                <DetailRow label="Request Date" value={formatDisplay(selectedItem.requestDate)} />
                <DetailRow
                  label="Selling Quantity"
                  value={selectedItem.orderDtl.sellingQuantity.toLocaleString()}
                  mono
                  align="right"
                />
                <DetailRow
                  label="Unit Price"
                  value={selectedItem.unitPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  mono
                  align="right"
                />
                <DetailRow
                  label="Qty per Container"
                  value={selectedItem.quantityPerCont.toLocaleString()}
                  mono
                  align="right"
                />
                <DetailRow
                  label="No. cont"
                  value={calcContainers(
                    selectedItem.orderDtl.sellingQuantity,
                    selectedItem.quantityPerCont
                  ).toLocaleString()}
                  mono
                  align="right"
                />
                <DetailRow
                  label="Total"
                  value={selectedItem.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  mono
                  align="right"
                  highlight
                />
                <DetailRow
                  label="ExWork Date"
                  value={formatDisplay(selectedItem.exWorkDate)}
                  caption="Set by Manufacture"
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

function DetailRow({
  label,
  value,
  mono,
  align,
  highlight,
  caption,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  align?: "left" | "right";
  highlight?: boolean;
  caption?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div
        className={cn(
          "flex flex-col items-end gap-0.5",
          align === "right" ? "items-end" : "items-end"
        )}
      >
        <span
          className={cn(
            mono && "font-mono text-xs",
            highlight && "text-primary font-semibold"
          )}
        >
          {value}
        </span>
        {caption && <span className="text-[10px] text-muted-foreground">{caption}</span>}
      </div>
    </div>
  );
}

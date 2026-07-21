import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Boxes,
  CalendarCheck,
  ChevronRight,
  Code2,
  DollarSign,
  Hash,
  Inbox,
  Layers,
  Loader2,
  AlertCircle,
  PackageOpen,
  X,
} from "lucide-react";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import PagePagination from "@/components/PagePagination";
import { PageShell } from "@/components/PageShell";
import { StatBar } from "@/components/StatBar";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { IconField } from "@/components/Detail/IconField";
import { MetaField } from "@/components/Detail/MetaField";
import { SectionCard } from "@/components/Detail/SectionCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { listLineItems } from "@/lib/lineItemApi";
import { useAuthStore } from "@/stores/authStore";
import { calcContainersNeeded, fmt } from "@/components/po/utils";
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

export default function MyOrders() {
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

  const customerCustId = useAuthStore((s) => s.account?.customerCustId);

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
          customerCustId,
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
    [customerCustId]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setQ(qDraft);
    }, 300);
    return () => clearTimeout(handle);
  }, [qDraft]);

  useEffect(() => {
    if (!customerCustId) return;
    loadPage({ reset: true, search: q, mode: activeMode });
  }, [q, activeMode, customerCustId, loadPage]);

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

  const selectedPoLineCount = useMemo(
    () =>
      selectedItem
        ? items.filter((it) => it.poNum === selectedItem.poNum).length
        : 0,
    [items, selectedItem]
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
            calcContainersNeeded(
              row.orderDtl.sellingQuantity,
              row.quantityPerCont
            )
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
    <PageShell className="gap-4">
      <SectionHeader
        title="My Orders"
        description={`${formatNumber(totalLines)} line${totalLines !== 1 ? "s" : ""} across ${groupedByPO.length} PO${groupedByPO.length !== 1 ? "s" : ""}`}
      />

      <div className="shrink-0">
        <StatBar
          items={[
            {
              label: "Total Lines",
              value: formatNumber(totalLines),
              icon: Box,
            },
            {
              label: "Total Value",
              value: `$ ${totalValue > 0 ? fmt(totalValue) : "0.00"}`,
              icon: DollarSign,
              primary: true,
            },
          ]}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mt-8">
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
            {q ? (
              <EmptyState
                variant="no-results"
                title={`No items match "${q}"`}
                description="Try a different PO number."
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No line items yet"
                description="Submit a purchase order to see items here."
              />
            )}
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
                      <Hash size={14} className="text-primary-light" />
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
                  <span className="text-sm font-bold text-primary-light font-mono">
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
        <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md overflow-y-auto p-0">
          {selectedItem && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                <SheetHeader className="p-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Order Detail
                  </span>
                  <SheetTitle className="font-mono text-xl mt-1">
                    {selectedItem.poNum}
                  </SheetTitle>
                </SheetHeader>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3 px-5 pb-5 text-sm">
                {/* Meta card */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetaField
                      label="Order Lines"
                      value={formatNumber(selectedPoLineCount)}
                      mono
                    />
                    <MetaField label="Customer ID" value={selectedItem.customerCustId} mono />
                    <MetaField label="Submitted" value={formatDisplay(selectedItem.createdAt)} />
                  </div>
                </div>

                {/* SHARED FIELDS */}
                <SectionCard title="Shared Fields" icon={Code2}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetaField label="Ship To Num" value={selectedItem.shipToNum} mono />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Mode
                      </span>
                      <div>{modePill(selectedItem.mode)}</div>
                    </div>
                    <MetaField label="Request Date" value={formatDisplay(selectedItem.requestDate)} />
                    <MetaField label="Need By Date" value={formatDisplay(selectedItem.needByDate)} />
                  </div>
                </SectionCard>

                {/* LINE FIELDS */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Line Fields
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    <IconField icon={Box} label="Part Number" value={selectedItem.orderDtl.partNum} mono />
                    <IconField icon={Hash} label="Order Line" value={String(selectedItem.orderDtl.orderLine)} mono />
                    <IconField
                      icon={PackageOpen}
                      label="Selling Qty"
                      value={formatNumber(selectedItem.orderDtl.sellingQuantity)}
                      mono
                    />
                    <IconField
                      icon={Layers}
                      label="Qty per Container"
                      value={formatNumber(selectedItem.quantityPerCont)}
                      mono
                    />
                    <IconField
                      icon={Boxes}
                      label="No. cont"
                      value={formatNumber(
                        calcContainersNeeded(
                          selectedItem.orderDtl.sellingQuantity,
                          selectedItem.quantityPerCont
                        )
                      )}
                      mono
                    />
                    <IconField
                      icon={DollarSign}
                      label="Unit Price"
                      value={fmt(selectedItem.unitPrice)}
                      mono
                    />
                    <IconField
                      icon={CalendarCheck}
                      label="ExWork Date"
                      value={formatDisplay(selectedItem.exWorkDate)}
                    />
                  </div>
                </div>

                {/* Total card */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
                    Total
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary-light">
                    $ {fmt(selectedItem.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

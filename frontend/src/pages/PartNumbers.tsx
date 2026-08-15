import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Boxes,
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import PagePagination from "@/components/PagePagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddPartNumDialog from "@/components/part-num/AddPartNumDialog";
import ImportPartNumDialog from "@/components/part-num/ImportPartNumDialog";
import {
  deletePartNum,
  listPartNumsPage,
  type ImportPartNumResponse,
  type PartNumOption,
} from "@/lib/apis/partNumApi";
import { extractErrorMessage } from "@/lib/apis/api";

const PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;

export default function PartNumbers() {
  const [items, setItems] = useState<PartNumOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PartNumOption | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestSeq = useRef(0);

  const loadPage = useCallback(
    async (opts: {
      reset: boolean;
      cursor?: string | null;
      search: string;
    }) => {
      const seq = ++requestSeq.current;
      if (opts.reset) {
        setLoading(true);
      } else {
        setLoadingPage(true);
      }
      try {
        const result = await listPartNumsPage({
          cursor: opts.reset ? null : opts.cursor ?? null,
          limit: PAGE_SIZE,
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
          extractErrorMessage(err, "Failed to load part numbers")
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
    }, SEARCH_DEBOUNCE_MS);
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
      const cursor =
        page === 1 ? null : cursorStack[page - 2] ?? null;
      setCursorStack(newStack);
      loadPage({ reset: false, cursor, search: q });
    } else if (page === currentPage + 1) {
      handleNext();
    }
  };

  const currentPage = cursorStack.length + 1;
  const visiblePageStart = Math.max(1, currentPage - 1);
  const visiblePages = [
    visiblePageStart,
    visiblePageStart + 1,
    visiblePageStart + 2,
  ];

  const refresh = useCallback(async () => {
    const cursor =
      cursorStack.length === 0
        ? null
        : cursorStack[cursorStack.length - 1] ?? null;
    await loadPage({ reset: false, cursor, search: q });
  }, [cursorStack, q, loadPage]);

  const onCreated = useCallback(() => {
    toast.success("Part number created");
    void refresh();
  }, [refresh]);

  const onImported = useCallback(
    (res: ImportPartNumResponse) => {
      const summary = `${res.createdCount} imported, ${res.skippedCount} skipped`;
      if (res.createdCount > 0) toast.success(summary);
      else toast.warning(summary);
      if (res.createdCount > 0) {
        void refresh();
      }
    },
    [refresh]
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePartNum(deleteTarget._id);
      if (sessionStorage.getItem("partNums") !== null) {
        sessionStorage.removeItem("partNums");
      }
      toast.success(`Part number "${deleteTarget.partNum}" deleted`);
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete"));
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<PartNumOption>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No.",
        align: "left",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.no}
          </span>
        ),
      },
      {
        key: "partNum",
        label: "Part Number",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <Boxes size={14} className="text-primary" />
            <span className="font-mono text-xs font-semibold">
              {row.partNum}
            </span>
          </div>
        ),
      },
      {
        key: "length",
        label: "L (cm)",
        align: "right",
        sortable: true,
        sortValue: (row) => row.dimension.length,
        render: (row) => (
          <span className="font-mono text-xs">{row.dimension.length}</span>
        ),
      },
      {
        key: "width",
        label: "W (cm)",
        align: "right",
        sortable: true,
        sortValue: (row) => row.dimension.width,
        render: (row) => (
          <span className="font-mono text-xs">{row.dimension.width}</span>
        ),
      },
      {
        key: "height",
        label: "H (cm)",
        align: "right",
        sortable: true,
        sortValue: (row) => row.dimension.height,
        render: (row) => (
          <span className="font-mono text-xs">{row.dimension.height}</span>
        ),
      },
      {
        key: "weightKg",
        label: "Weight (kg)",
        align: "right",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs">
            {Number.isFinite(row.weightKg) ? row.weightKg : 0}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        align: "right",
        sortable: false,
        render: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label={`Delete ${row.partNum}`}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        ),
      },
    ],
    []
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
      <ActionToolbar
        search={qDraft}
        setSearch={setQDraft}
        searchPlaceholder="Search part number..."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="shrink-0"
          >
            <FileSpreadsheet />
            Import Excel
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="shrink-0"
          >
            <Plus />
            Add Part Num
          </Button>
        </div>
      </ActionToolbar>

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
              onClick={() => {
                void loadPage({ reset: true, search: q });
              }}
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
        emptyMessage={
          q ? (
            <span className="flex flex-col items-center gap-1">
              <span>No part numbers match &ldquo;{q}&rdquo;</span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1">
              <span>No part numbers yet</span>
              <span className="text-xs">
                Click <strong>Add Part Num</strong> or{" "}
                <strong>Import Excel</strong> to get started.
              </span>
            </span>
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

      <AddPartNumDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={onCreated}
      />

      <ImportPartNumDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={onImported}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !deleting && !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete part number?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-mono font-semibold">
                {deleteTarget?.partNum}
              </span>{" "}
              from the catalogue. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

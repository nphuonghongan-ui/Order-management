import { useState, useMemo, type ReactNode, type MouseEvent } from "react";
import {
  SquarePen,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Column<T> {
  key: string;
  label: string;
  labelTooltip?: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  width?: string;
  sortable?: boolean;
  nullsSort?: "always-end" | "direction-aware";
  sortValue?: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onRowClick?: (row: T) => void;
  onContextMenu?: (e: MouseEvent, row: T) => void;
  selectedRowIds?: Iterable<string>;
  emptyMessage?: ReactNode;
  rowClassName?: (row: T) => string;
}

export default function DataTable<T extends { _id: string }>({
  columns,
  data = [],
  onEdit,
  onDelete,
  onRowClick,
  onContextMenu,
  selectedRowIds,
  emptyMessage = "No data available",
  rowClassName,
}: DataTableProps<T>) {
  const selectedSet = useMemo(
    () => (selectedRowIds ? new Set(selectedRowIds) : null),
    [selectedRowIds]
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const sortCol = columns.find((c) => c.key === sortKey);
    const nullsEnd =
      sortCol?.nullsSort !== "direction-aware" || sortDir === "asc";
    return [...data].sort((a, b) => {
      const aVal = sortCol?.sortValue
        ? sortCol.sortValue(a)
        : (a[sortKey as keyof T] as unknown);
      const bVal = sortCol?.sortValue
        ? sortCol.sortValue(b)
        : (b[sortKey as keyof T] as unknown);
      if (aVal == null) return nullsEnd ? 1 : -1;
      if (bVal == null) return nullsEnd ? -1 : 1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDir, columns]);

  const hasActions = onEdit || onDelete;
  const colCount = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="h-full w-full overflow-auto bg-card">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={cn(
                  "text-left font-bold text-xs uppercase tracking-wide py-3 px-4 text-muted-foreground select-none",
                  col.align === "right" && "text-right",
                  col.sortable !== false && "cursor-pointer hover:text-foreground",
                  col.width
                )}
              >
                <span className="inline-flex items-center gap-0.5">
                  {col.label}
                  {col.labelTooltip && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="inline-flex items-center cursor-help"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info size={13} className="text-muted-foreground/50 hover:text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[16rem] text-xs">
                          {col.labelTooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {col.sortable !== false && (
                    sortKey === col.key ? (
                      sortDir === "asc"
                        ? <ArrowDown size={12} className="ml-1 text-primary" />
                        : <ArrowUp size={12} className="ml-1 text-primary" />
                    ) : (
                      <ArrowUpDown size={12} className="ml-1 text-muted-foreground/50" />
                    )
                  )}
                </span>
              </th>
            ))}
            {hasActions && (
              <th className="text-right font-bold text-xs uppercase tracking-wide py-3 px-4 text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox size={32} className="opacity-40" />
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => {
              const isSelected = selectedSet?.has(row._id) ?? false;
              return (
              <tr
                key={row._id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onContextMenu={
                  onContextMenu ? (e) => onContextMenu(e, row) : undefined
                }
                className={cn(
                  "border-t border-border transition-colors",
                  onRowClick && "cursor-pointer",
                  onContextMenu && "context-menu",
                  isSelected
                    ? "bg-primary/10"
                    : i % 2 === 1
                      ? "bg-muted/20"
                      : "hover:bg-muted/50",
                  rowClassName?.(row)
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "py-3 px-4 text-foreground",
                      col.align === "right" && "text-right",
                      col.mono && "font-mono text-xs",
                      col.width
                    )}
                  >
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
                {hasActions && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <SquarePen size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

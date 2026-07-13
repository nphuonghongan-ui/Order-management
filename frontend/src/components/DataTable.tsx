import { useState, useMemo, type ReactNode } from "react";
import {
  SquarePen,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  mono?: boolean;
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
  emptyMessage?: ReactNode;
  rowClassName?: (row: T) => string;
}

export default function DataTable<T extends { _id: string }>({
  columns,
  data = [],
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  rowClassName,
}: DataTableProps<T>) {
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
    <div className="w-full overflow-x-auto bg-card">
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
                  col.sortable !== false && "cursor-pointer hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center">
                  {col.label}
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
            sortedData.map((row) => (
              <tr
                key={row._id}
                className={cn(
                  "border-t border-border hover:bg-muted/50 transition-colors",
                  rowClassName?.(row)
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "py-3 px-4 text-foreground",
                      col.align === "right" && "text-right",
                      col.mono && "font-mono text-xs"
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
                          onClick={() => onEdit(row)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <SquarePen size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

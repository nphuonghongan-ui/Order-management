import { useState, useMemo } from "react";
import {
  SquarePen,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DataTable({
  columns,
  data = [],
  onEdit,
  onDelete,
  emptyMessage = "No data available",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDir]);

  const hasActions = onEdit || onDelete;
  const colCount = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
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
                        ? <ArrowUp size={12} className="ml-1 text-primary" />
                        : <ArrowDown size={12} className="ml-1 text-primary" />
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
                className="border-t border-border hover:bg-muted/50 transition-colors"
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
                    {col.render ? col.render(row) : row[col.key]}
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

import { cn } from "@/lib/utils";

type SkeletonRowProps = {
  columns: number;
  className?: string;
  widths?: number[];
};

const DEFAULT_WIDTHS = [40, 28, 20, 32, 24, 28];

export function SkeletonRow({
  columns,
  className,
  widths = DEFAULT_WIDTHS,
}: SkeletonRowProps) {
  return (
    <tr className={cn("border-t border-border", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div
            className="h-3 rounded bg-muted animate-pulse"
            style={{ width: `${widths[i % widths.length]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

type SkeletonTableProps = {
  rows?: number;
  columns: number;
  className?: string;
  widths?: number[];
};

export function SkeletonTable({
  rows = 6,
  columns,
  className,
  widths,
}: SkeletonTableProps) {
  return (
    <tbody className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow
          key={i}
          columns={columns}
          widths={widths}
        />
      ))}
    </tbody>
  );
}

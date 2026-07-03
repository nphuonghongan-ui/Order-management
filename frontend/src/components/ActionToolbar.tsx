import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface ActionToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  filters?: FilterOption[];
  activeFilter?: string;
  setActiveFilter?: (value: string) => void;
  ctaLabel?: string;
  onCTA?: () => void;
}

export default function ActionToolbar({
  search,
  setSearch,
  filters = [],
  activeFilter,
  setActiveFilter,
  ctaLabel,
  onCTA,
}: ActionToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center border border-border rounded-md px-3 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors w-64">
          <Search size={16} className="text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {filters.length > 0 && setActiveFilter && (
          <div className="flex items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {ctaLabel && onCTA && (
        <button
          onClick={onCTA}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-light transition-colors shrink-0"
        >
          <Plus size={16} />
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

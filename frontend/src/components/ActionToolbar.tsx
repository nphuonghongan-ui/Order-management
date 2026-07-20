import { Search, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  value: string;
  label: string;
}

interface ActionToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  setActiveFilter?: (value: string) => void;
  ctaLabel?: string;
  onCTA?: () => void;
  className?: string;
}

export default function ActionToolbar({
  search,
  setSearch,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilter,
  setActiveFilter,
  ctaLabel,
  onCTA,
  className,
}: ActionToolbarProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center border border-border rounded-md px-3 h-9 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors w-full sm:w-72 bg-card">
          <Search size={16} className="text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60 min-w-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {filters.length > 0 && setActiveFilter && (
          <div className="flex items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  activeFilter === f.value
                    ? "bg-primary-light text-primary-foreground"
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
        <Button onClick={onCTA} className="shrink-0">
          <Plus />
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

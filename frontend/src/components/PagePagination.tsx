import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PagePaginationProps {
  disabled: boolean;
  loading: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageJump: (page: number) => void;
  currentPage: number;
  visiblePages: number[];
}

export default function PagePagination({
  disabled,
  loading,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onPageJump,
  currentPage,
  visiblePages,
}: PagePaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Pagination className="ml-auto mr-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (!canGoPrev || disabled) return;
                onPrev();
              }}
              aria-disabled={!canGoPrev || disabled}
              className={cn(
                !canGoPrev || disabled
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              )}
            />
          </PaginationItem>
          {visiblePages.map((p) => {
            const isActive = p === currentPage;
            const isUnreachable = p > currentPage + 1;
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={isActive}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageJump(p);
                  }}
                  aria-disabled={isUnreachable || disabled}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    isUnreachable && "pointer-events-none opacity-50",
                    !isActive && !isUnreachable && "cursor-pointer"
                  )}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          {canGoNext && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (!canGoNext || disabled) return;
                onNext();
              }}
              aria-disabled={!canGoNext || disabled}
              className={cn(
                !canGoNext || disabled
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {loading && (
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

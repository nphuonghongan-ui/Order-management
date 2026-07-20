import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

type CursorPaginationOptions<T, F> = {
  fetcher: (args: { cursor: string | null; search: string }) => Promise<CursorPage<T>>;
  search: string;
  debounceMs?: number;
  extra?: F;
};

type CursorPaginationResult<T> = {
  items: T[];
  loading: boolean;
  loadingPage: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  visiblePages: number[];
  setSearch: (s: string) => void;
  retry: () => void;
  next: () => void;
  prev: () => void;
  jumpTo: (page: number) => void;
};

export function useCursorPagination<T, F = unknown>({
  fetcher,
  search,
  debounceMs = 300,
  extra,
}: CursorPaginationOptions<T, F>): CursorPaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const seqRef = useRef(0);
  const [internalSearch, setInternalSearch] = useState(search);
  const [effectiveSearch, setEffectiveSearch] = useState(search);

  useEffect(() => {
    const handle = setTimeout(() => {
      setEffectiveSearch(internalSearch);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [internalSearch, debounceMs]);

  const loadPage = useCallback(
    async (opts: { reset: boolean; cursor?: string | null }) => {
      const seq = ++seqRef.current;
      if (opts.reset) setLoading(true);
      else setLoadingPage(true);
      try {
        const result = await fetcher({
          cursor: opts.reset ? null : opts.cursor ?? null,
          search: effectiveSearch,
        });
        if (seq !== seqRef.current) return;
        setItems(result.items);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        if (opts.reset) setCursorStack([]);
        setError(null);
      } catch {
        if (seq !== seqRef.current) return;
        setError("Failed to load items");
      } finally {
        if (seq === seqRef.current) {
          if (opts.reset) setLoading(false);
          else setLoadingPage(false);
        }
      }
    },
    [fetcher, effectiveSearch]
  );

  useEffect(() => {
    void loadPage({ reset: true });
  }, [effectiveSearch, loadPage, extra]);

  const prev = useCallback(() => {
    if (cursorStack.length === 0) return;
    const next = cursorStack.slice(0, -1);
    const cursor = next.length === 0 ? null : next[next.length - 1] ?? null;
    setCursorStack(next);
    void loadPage({ reset: false, cursor });
  }, [cursorStack, loadPage]);

  const next = useCallback(() => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    void loadPage({ reset: false, cursor: nextCursor });
  }, [nextCursor, loadPage]);

  const jumpTo = useCallback(
    (page: number) => {
      const currentPage = cursorStack.length + 1;
      if (page === currentPage || loadingPage) return;
      if (page < currentPage) {
        const newStack = cursorStack.slice(0, page - 1);
        const cursor = page === 1 ? null : cursorStack[page - 2] ?? null;
        setCursorStack(newStack);
        void loadPage({ reset: false, cursor });
      } else if (page === currentPage + 1) {
        next();
      }
    },
    [cursorStack, loadingPage, loadPage, next]
  );

  const retry = useCallback(async () => {
    const cursor =
      cursorStack.length === 0 ? null : cursorStack[cursorStack.length - 1] ?? null;
    await loadPage({ reset: false, cursor });
  }, [cursorStack, loadPage]);

  const currentPage = cursorStack.length + 1;
  const visiblePageStart = Math.max(1, currentPage - 1);
  const visiblePages = [
    visiblePageStart,
    visiblePageStart + 1,
    visiblePageStart + 2,
  ];

  return {
    items,
    loading,
    loadingPage,
    error,
    currentPage,
    hasMore,
    canGoPrev: cursorStack.length > 0,
    canGoNext: hasMore,
    visiblePages,
    setSearch: setInternalSearch,
    retry,
    next,
    prev,
    jumpTo,
  };
}

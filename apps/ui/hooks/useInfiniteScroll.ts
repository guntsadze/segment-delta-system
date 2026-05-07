import { PaginatedResult, PaginationState } from "@/types/pagination.types";
import { useState, useEffect, useCallback } from "react";

export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<PaginatedResult<T>>,
  deps: any[] = [],
): PaginationState<T> {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(
    async (isReset = false) => {
      if (loading || (!hasMore && !isReset)) return;

      setLoading(true);
      try {
        const pageToFetch = isReset ? 1 : page;
        const response = await fetchFn(pageToFetch);

        const items = response.data;
        const meta = response.meta;

        setData((prev) => (isReset ? items : [...prev, ...items]));
        setPage(pageToFetch + 1);

        setHasMore(pageToFetch < meta.totalPages);
      } catch (err) {
        console.error("Pagination error:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, loading, hasMore, fetchFn],
  );

  useEffect(() => {
    loadData(true);
  }, deps);

  return {
    items: data,
    isLoading: loading,
    hasMore,
    loadMore: () => loadData(false),
    refresh: () => loadData(true),
    setData,
  };
}

import { Dispatch, SetStateAction } from "react";

export interface QueryParams {
  [key: string]: any;
}

export interface PaginationParams extends QueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationState<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  setData: Dispatch<SetStateAction<T[]>>;
  refresh: () => void;
}

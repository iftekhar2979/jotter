export interface Pagination {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
    itemsPerPage: number;
  }
  
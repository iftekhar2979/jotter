import { Pagination } from "./pagination.interface";

export function pagination(limit: number, page: number, total: number){
    // console.log(page,"from pagination")
    const totalPages = Math.ceil(total / limit);
    return {
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      nextPage: page < totalPages ? page + 1 : null,   // next page
      previousPage: page > 1 ? page - 1 : null,         // previous page
      itemsPerPage: limit
    };
  }
  
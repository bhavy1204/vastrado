import { useState, useCallback } from "react";
import { DEFAULT_PAGE_SIZE } from "./constant.js";

// Usage:
//   const { page, limit, params, nextPage, prevPage, setTotalPages, hasNextPage } = usePagination();
//   const res = await productService.getAll({ ...params, gender: "men" });
//   setTotalPages(res.data.data.totalPages);

export default function usePagination(initialPage = 1, initialLimit = DEFAULT_PAGE_SIZE) {

    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalPages, setTotalPages] = useState(1);

    const nextPage = useCallback(() => {
        setPage((p) => Math.min(p + 1, totalPages));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setPage((p) => Math.max(p - 1, 1));
    }, []);

    const goToPage = useCallback(
        (targetPage) => {
            setPage(Math.min(Math.max(targetPage, 1), totalPages));
        },
        [totalPages]
    );

    const resetPage = useCallback(() => setPage(1), []);

    return {
        page,
        limit,
        totalPages,
        setTotalPages,
        params: { page, limit },
        nextPage,
        prevPage,
        goToPage,
        resetPage,    
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}




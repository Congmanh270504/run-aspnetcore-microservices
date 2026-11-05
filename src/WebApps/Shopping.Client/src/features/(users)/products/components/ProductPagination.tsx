"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ProductPagination({
    currentPage,
    totalPages,
    onPageChange,
}: Props) {
    if (totalPages <= 1) return null;

    // Helper to generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push("...");
            }
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 pt-8 pb-4">
            {/* Previous Page */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 text-sm font-medium">
                {pages.map((p, idx) => {
                    if (p === "...") {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-1 text-stone-400 select-none"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = Number(p);
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => onPageChange(pageNumber)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all text-xs font-semibold ${
                                isActive
                                    ? "bg-[#203D30] text-white shadow-sm"
                                    : "text-stone-700 hover:bg-stone-100"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            {/* Next Page */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

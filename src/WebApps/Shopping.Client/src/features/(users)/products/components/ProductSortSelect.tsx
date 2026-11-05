"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SortOption } from "../types";

interface Props {
    totalCount: number;
    startIndex: number;
    endIndex: number;
    sortBy: SortOption;
    onSortChange: (value: SortOption) => void;
}

export function ProductSortSelect({
    totalCount,
    startIndex,
    endIndex,
    sortBy,
    onSortChange,
}: Props) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            {/* Showing Count */}
            <div className="text-sm text-stone-600">
                {totalCount === 0 ? (
                    "No results found"
                ) : (
                    <>
                        Showing{" "}
                        <span className="font-semibold text-stone-900">
                            {startIndex}-{endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-stone-900">
                            {totalCount}
                        </span>{" "}
                        results
                    </>
                )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-sm text-stone-600 shrink-0">Sort by :</span>
                <Select
                    value={sortBy}
                    onValueChange={(val) => onSortChange(val as SortOption)}
                >
                    <SelectTrigger className="h-9 w-[170px] rounded-lg border-stone-200 bg-white text-xs font-medium text-stone-800 shadow-xs focus:ring-1 focus:ring-[#203D30]">
                        <SelectValue placeholder="Default Sorting" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                        <SelectItem value="default">Default Sorting</SelectItem>
                        <SelectItem value="bestseller">Best Seller</SelectItem>
                        <SelectItem value="rating">Average Rating</SelectItem>
                        <SelectItem value="newest">New Arrivals</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

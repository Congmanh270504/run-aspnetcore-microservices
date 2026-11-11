"use client";

import React from "react";
import { X } from "lucide-react";
import { ProductFilterState } from "../types";
import { Button } from "@/components/ui/button";

interface Props {
    filterState: ProductFilterState;
    onRemoveCategory: (category: string) => void;
    onRemoveSkinType: (type: string) => void;
    onResetPrice: () => void;
    onRemoveRating: (rating: number) => void;
    onRemovePromotion: (promo: string) => void;
    onRemoveAvailability: (avail: string) => void;
    onClearAll: () => void;
}

export function ProductActiveFilters({
    filterState,
    onRemoveCategory,
    onRemoveSkinType,
    onResetPrice,
    onRemoveRating,
    onRemovePromotion,
    onRemoveAvailability,
    onClearAll,
}: Props) {
    const isPriceFiltered =
        filterState.priceRange[0] > 0 || filterState.priceRange[1] < 1000;

    const hasAnyActiveFilter =
        filterState.categories.length > 0 ||
        filterState.skinTypes.length > 0 ||
        isPriceFiltered ||
        filterState.ratings.length > 0 ||
        filterState.promotions.length > 0 ||
        filterState.availability.length > 0;

    if (!hasAnyActiveFilter) return null;

    return (
        <div className="flex flex-wrap items-center gap-2.5 py-1">
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Active Filter
            </span>

            {/* Price Filter Pill */}
            {isPriceFiltered && (
                <button
                    type="button"
                    onClick={onResetPrice}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>
                        Price : ${filterState.priceRange[0].toFixed(2)} - $
                        {filterState.priceRange[1].toFixed(2)}
                    </span>
                    <X className="h-3 w-3" />
                </button>
            )}

            {/* Categories */}
            {filterState.categories.map((cat) => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => onRemoveCategory(cat)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>{cat}</span>
                    <X className="h-3 w-3" />
                </button>
            ))}

            {/* Skin Types */}
            {filterState.skinTypes.map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => onRemoveSkinType(type)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>{type}</span>
                    <X className="h-3 w-3" />
                </button>
            ))}

            {/* Promotions */}
            {filterState.promotions.map((promo) => (
                <button
                    key={promo}
                    type="button"
                    onClick={() => onRemovePromotion(promo)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>{promo}</span>
                    <X className="h-3 w-3" />
                </button>
            ))}

            {/* Availability */}
            {filterState.availability.map((avail) => (
                <button
                    key={avail}
                    type="button"
                    onClick={() => onRemoveAvailability(avail)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>{avail}</span>
                    <X className="h-3 w-3" />
                </button>
            ))}

            {/* Ratings */}
            {filterState.ratings.map((rating) => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onRemoveRating(rating)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#203D30] dark:bg-emerald-800/90 dark:border dark:border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    <span>{rating} Star</span>
                    <X className="h-3 w-3" />
                </button>
            ))}

            {/* Clear All Link */}
            <Button
                type="button"
                variant={"outline"}
                onClick={onClearAll}
                className="ml-2 text-xs font-semibold text-[#A06C3B] dark:text-[#E5A96A] hover:underline focus:outline-none dark:border-stone-700"
            >
                Clear All
            </Button>
        </div>
    );
}

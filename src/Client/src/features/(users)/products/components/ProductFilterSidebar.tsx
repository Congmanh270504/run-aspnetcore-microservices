"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { ProductFilterState } from "../types";

interface Props {
    filterState: ProductFilterState;
    availableCategories: string[];
    onFilterChange: (updater: (prev: ProductFilterState) => ProductFilterState) => void;
}

const SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];
const PROMOTIONS = ["New Arrivals", "Best Sellers", "On Sale"];
const AVAILABILITIES = ["In Stock", "Out of Stocks"];
const RATING_STARS = [5, 4, 3, 2, 1];

export function ProductFilterSidebar({
    filterState,
    availableCategories,
    onFilterChange,
}: Props) {
    // Default categories from the design if none exist yet, or combined
    const defaultCategories = [
        "Skin Care",
        "Makeup",
        "Hair Care",
        "Fragrances",
        "Nail Care",
        "Body Care",
    ];

    const displayCategories = Array.from(
        new Set([...defaultCategories, ...availableCategories]),
    );

    const handleCategoryToggle = (category: string) => {
        onFilterChange((prev) => {
            const exists = prev.categories.includes(category);
            const nextCategories = exists
                ? prev.categories.filter((c) => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: nextCategories, page: 1 };
        });
    };

    const handleSkinTypeToggle = (type: string) => {
        onFilterChange((prev) => {
            const exists = prev.skinTypes.includes(type);
            const nextTypes = exists
                ? prev.skinTypes.filter((t) => t !== type)
                : [...prev.skinTypes, type];
            return { ...prev, skinTypes: nextTypes, page: 1 };
        });
    };

    const handleRatingToggle = (star: number) => {
        onFilterChange((prev) => {
            const exists = prev.ratings.includes(star);
            const nextRatings = exists
                ? prev.ratings.filter((r) => r !== star)
                : [...prev.ratings, star];
            return { ...prev, ratings: nextRatings, page: 1 };
        });
    };

    const handlePromotionToggle = (promo: string) => {
        onFilterChange((prev) => {
            const exists = prev.promotions.includes(promo);
            const nextPromos = exists
                ? prev.promotions.filter((p) => p !== promo)
                : [...prev.promotions, promo];
            return { ...prev, promotions: nextPromos, page: 1 };
        });
    };

    const handleAvailabilityToggle = (avail: string) => {
        onFilterChange((prev) => {
            const exists = prev.availability.includes(avail);
            const nextAvail = exists
                ? prev.availability.filter((a) => a !== avail)
                : [...prev.availability, avail];
            return { ...prev, availability: nextAvail, page: 1 };
        });
    };

    const handleMinPriceChange = (value: number) => {
        onFilterChange((prev) => ({
            ...prev,
            priceRange: [Math.min(value, prev.priceRange[1] - 5), prev.priceRange[1]],
            page: 1,
        }));
    };

    const handleMaxPriceChange = (value: number) => {
        onFilterChange((prev) => ({
            ...prev,
            priceRange: [prev.priceRange[0], Math.max(value, prev.priceRange[0] + 5)],
            page: 1,
        }));
    };

    return (
        <aside className="w-full space-y-7 text-stone-800">
            {/* Main Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900">
                    Filter Options
                </h2>
            </div>

            {/* By Categories */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <h3 className="text-sm font-semibold text-stone-900">
                    By Categories
                </h3>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {displayCategories.map((cat) => {
                        const checked = filterState.categories.includes(cat);
                        return (
                            <label
                                key={cat}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-stone-900 select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleCategoryToggle(cat)}
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30]"
                                />
                                <span className={checked ? "font-medium text-stone-900" : ""}>
                                    {cat}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* By Skin Type */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <h3 className="text-sm font-semibold text-stone-900">
                    By Skin Type
                </h3>
                <div className="space-y-2.5">
                    {SKIN_TYPES.map((type) => {
                        const checked = filterState.skinTypes.includes(type);
                        return (
                            <label
                                key={type}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-stone-900 select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleSkinTypeToggle(type)}
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30]"
                                />
                                <span className={checked ? "font-medium text-stone-900" : ""}>
                                    {type}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-stone-900">Price</h3>
                </div>
                <div className="text-sm font-medium text-stone-600">
                    ${filterState.priceRange[0].toFixed(2)} - ${filterState.priceRange[1].toFixed(2)}
                </div>

                {/* Range Slider Track */}
                <div className="space-y-2 pt-1">
                    <div className="relative flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="300"
                            step="5"
                            value={filterState.priceRange[0]}
                            onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                            className="w-full accent-[#203D30] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                        />
                    </div>
                    <div className="relative flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="300"
                            step="5"
                            value={filterState.priceRange[1]}
                            onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                            className="w-full accent-[#203D30] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <h3 className="text-sm font-semibold text-stone-900">Review</h3>
                <div className="space-y-2.5">
                    {RATING_STARS.map((star) => {
                        const checked = filterState.ratings.includes(star);
                        return (
                            <label
                                key={star}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-stone-900 select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleRatingToggle(star)}
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30]"
                                />
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${
                                                    i < star
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "fill-stone-200 text-stone-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-stone-600 ml-1">
                                        {star} Star
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* By Promotions */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <h3 className="text-sm font-semibold text-stone-900">
                    By Promotions
                </h3>
                <div className="space-y-2.5">
                    {PROMOTIONS.map((promo) => {
                        const checked = filterState.promotions.includes(promo);
                        return (
                            <label
                                key={promo}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-stone-900 select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handlePromotionToggle(promo)}
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30]"
                                />
                                <span className={checked ? "font-medium text-stone-900" : ""}>
                                    {promo}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-3.5 border-t border-stone-200/80 pt-6">
                <h3 className="text-sm font-semibold text-stone-900">
                    Availability
                </h3>
                <div className="space-y-2.5">
                    {AVAILABILITIES.map((avail) => {
                        const checked = filterState.availability.includes(avail);
                        return (
                            <label
                                key={avail}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-stone-900 select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleAvailabilityToggle(avail)}
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30]"
                                />
                                <span className={checked ? "font-medium text-stone-900" : ""}>
                                    {avail}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

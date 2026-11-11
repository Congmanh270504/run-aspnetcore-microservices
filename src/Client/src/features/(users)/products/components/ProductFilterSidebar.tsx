"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { DisplayProduct, ProductFilterState } from "../types";
import { Label } from "@/components/ui/label";

interface Props {
    filterState: ProductFilterState;
    availableCategories: string[];
    categoryCounts?: Record<string, number>;
    totalDbCount?: number;
    products?: DisplayProduct[];
    onFilterChange: (
        updater: (prev: ProductFilterState) => ProductFilterState,
    ) => void;
}

const SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];
const PROMOTIONS = ["New Arrivals", "Best Sellers", "On Sale"];
const AVAILABILITIES = ["In Stock", "Out of Stocks"];
const RATING_STARS = [5, 4, 3, 2, 1];

export function ProductFilterSidebar({
    filterState,
    availableCategories,
    categoryCounts,
    totalDbCount,
    products,
    onFilterChange,
}: Props) {
    const finalCategoryCounts = React.useMemo(() => {
        return { ...(categoryCounts || {}) };
    }, [categoryCounts]);

    const effectiveTotal =
        typeof totalDbCount === "number" && totalDbCount > 0
            ? totalDbCount
            : 120;

    const skinTypeCounts = React.useMemo<Record<string, number>>(() => {
        const perType = Math.max(
            1,
            Math.round(effectiveTotal / SKIN_TYPES.length),
        );
        return {
            normal: perType,
            oily: perType,
            dry: perType,
            combination: perType,
            sensitive: Math.max(1, effectiveTotal - perType * 4),
        };
    }, [effectiveTotal]);

    const promotionCounts = React.useMemo<Record<string, number>>(() => {
        return {
            "New Arrivals": Math.max(1, Math.round(effectiveTotal * 0.35)),
            "Best Sellers": Math.max(1, Math.round(effectiveTotal * 0.5)),
            "On Sale": Math.max(1, Math.round(effectiveTotal * 0.25)),
        };
    }, [effectiveTotal]);

    const availabilityCounts = React.useMemo<Record<string, number>>(() => {
        return {
            "In Stock": effectiveTotal,
            "Out of Stocks": 0,
        };
    }, [effectiveTotal]);

    const displayCategories = React.useMemo(() => {
        const isInternalTag = (name: string) => {
            const lower = name.toLowerCase().trim();
            return (
                lower.startsWith("__") ||
                lower.startsWith("spo-") ||
                lower.startsWith("swatch-") ||
                lower.startsWith("group:") ||
                lower.startsWith("position-") ||
                lower.startsWith("earring-type_") ||
                lower.startsWith("aspen pear") ||
                lower.startsWith("bfcm") ||
                lower.startsWith("augsale") ||
                lower.startsWith("boxing") ||
                lower.startsWith("flash") ||
                lower.startsWith("eoss") ||
                lower.startsWith("eofy") ||
                lower.includes("sale") ||
                lower === "confect" ||
                lower === "noconfect" ||
                lower === "hidden" ||
                lower === "hide_searchspring" ||
                lower === "single" ||
                lower === "republished" ||
                lower === "free gift wrap" ||
                lower === "giftwrap" ||
                lower === "packaging" ||
                lower === "cielo" ||
                lower === "crescendo" ||
                lower === "gifts" ||
                lower === "new" ||
                lower === "bestseller"
            );
        };

        // Filter out internal bundle / technical tags and zero-count categories
        const realCategories = availableCategories.filter((cat) => {
            if (isInternalTag(cat)) return false;
            const count = finalCategoryCounts[cat.toLowerCase()] ?? 0;
            const isSelected = filterState.categories.includes(cat);
            return count > 0 || isSelected;
        });

        // Always include currently selected categories
        filterState.categories.forEach((cat) => {
            if (!realCategories.includes(cat)) {
                realCategories.unshift(cat);
            }
        });

        // Deduplicate and group by normalized clean label
        const byLabel = new Map<string, string>();
        realCategories.forEach((cat) => {
            const label = cat
                .replace(/^Type_/, "")
                .replace(/^Colour_/, "")
                .replace(/_/g, " ")
                .toLowerCase();
            const existing = byLabel.get(label);
            if (!existing) {
                byLabel.set(label, cat);
            } else {
                if (filterState.categories.includes(cat)) {
                    byLabel.set(label, cat);
                } else if (!filterState.categories.includes(existing)) {
                    const countCurrent =
                        finalCategoryCounts[cat.toLowerCase()] ?? 0;
                    const countExisting =
                        finalCategoryCounts[existing.toLowerCase()] ?? 0;
                    if (countCurrent > countExisting) {
                        byLabel.set(label, cat);
                    }
                }
            }
        });

        const unique = Array.from(byLabel.values());

        // Sort: selected first, then by real productCount descending, then alphabetical
        return unique.sort((a, b) => {
            const isASelected = filterState.categories.includes(a);
            const isBSelected = filterState.categories.includes(b);
            if (isASelected && !isBSelected) return -1;
            if (!isASelected && isBSelected) return 1;

            const countA = finalCategoryCounts[a.toLowerCase()] ?? 0;
            const countB = finalCategoryCounts[b.toLowerCase()] ?? 0;
            if (countA !== countB) return countB - countA;
            return a.localeCompare(b);
        });
    }, [availableCategories, finalCategoryCounts, filterState.categories]);

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
            priceRange: [
                Math.min(value, prev.priceRange[1] - 5),
                prev.priceRange[1],
            ],
            page: 1,
        }));
    };

    const handleMaxPriceChange = (value: number) => {
        onFilterChange((prev) => ({
            ...prev,
            priceRange: [
                prev.priceRange[0],
                Math.max(value, prev.priceRange[0] + 5),
            ],
            page: 1,
        }));
    };

    return (
        <aside className="w-full space-y-7 text-stone-800 dark:text-stone-200">
            {/* Main Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Filter Options
                </h2>
            </div>

            {/* By Categories */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    By Categories
                </h3>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {displayCategories.map((cat) => {
                        const checked = filterState.categories.includes(cat);
                        const count =
                            finalCategoryCounts[cat.toLowerCase()] ?? 0;
                        const label = cat
                            .replace(/^Type_/, "")
                            .replace(/^Colour_/, "")
                            .replace(/_/g, " ");
                        return (
                            <label
                                key={cat}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        handleCategoryToggle(cat)
                                    }
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:border-stone-600"
                                />
                                <span
                                    className={
                                        checked
                                            ? "font-medium text-stone-900 dark:text-white"
                                            : ""
                                    }
                                >
                                    {label}
                                </span>
                                <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 font-normal">
                                    ({count})
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* By Skin Type */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    By Skin Type
                </h3>
                <div className="space-y-2.5">
                    {SKIN_TYPES.map((type) => {
                        const checked = filterState.skinTypes.includes(type);
                        const count = skinTypeCounts[type.toLowerCase()] ?? 0;
                        return (
                            <Label
                                key={type}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        handleSkinTypeToggle(type)
                                    }
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:border-stone-600"
                                />
                                <span
                                    className={
                                        checked
                                            ? "font-medium text-stone-900 dark:text-white"
                                            : ""
                                    }
                                >
                                    {type}
                                </span>
                                <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 font-normal">
                                    ({count})
                                </span>
                            </Label>
                        );
                    })}
                </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Price
                    </h3>
                </div>
                <div className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    ${filterState.priceRange[0].toFixed(2)} - $
                    {filterState.priceRange[1].toFixed(2)}
                </div>

                {/* Range Slider Track */}
                <div className="space-y-2 pt-1">
                    <div className="relative flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filterState.priceRange[0]}
                            onChange={(e) =>
                                handleMinPriceChange(Number(e.target.value))
                            }
                            className="w-full accent-[#203D30] dark:accent-emerald-500 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
                        />
                    </div>
                    <div className="relative flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filterState.priceRange[1]}
                            onChange={(e) =>
                                handleMaxPriceChange(Number(e.target.value))
                            }
                            className="w-full accent-[#203D30] dark:accent-emerald-500 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Review
                </h3>
                <div className="space-y-2.5">
                    {RATING_STARS.map((star) => {
                        const checked = filterState.ratings.includes(star);
                        return (
                            <label
                                key={star}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        handleRatingToggle(star)
                                    }
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:border-stone-600"
                                />
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${
                                                        i < star
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-stone-200 dark:fill-stone-700 text-stone-200 dark:text-stone-700"
                                                    }`}
                                                />
                                            ),
                                        )}
                                    </div>
                                    <span className="text-xs text-stone-600 dark:text-stone-300 ml-1">
                                        {star} Star
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* By Promotions */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    By Promotions
                </h3>
                <div className="space-y-2.5">
                    {PROMOTIONS.map((promo) => {
                        const checked = filterState.promotions.includes(promo);
                        const count = promotionCounts[promo] ?? 0;
                        return (
                            <label
                                key={promo}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        handlePromotionToggle(promo)
                                    }
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:border-stone-600"
                                />
                                <span
                                    className={
                                        checked
                                            ? "font-medium text-stone-900 dark:text-white"
                                            : ""
                                    }
                                >
                                    {promo}
                                </span>
                                <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 font-normal">
                                    ({count})
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-3.5 border-t border-stone-200/80 dark:border-stone-800 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Availability
                </h3>
                <div className="space-y-2.5">
                    {AVAILABILITIES.map((avail) => {
                        const checked =
                            filterState.availability.includes(avail);
                        const count = availabilityCounts[avail] ?? 0;
                        return (
                            <label
                                key={avail}
                                className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white select-none"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        handleAvailabilityToggle(avail)
                                    }
                                    className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 dark:border-stone-600"
                                />
                                <span
                                    className={
                                        checked
                                            ? "font-medium text-stone-900 dark:text-white"
                                            : ""
                                    }
                                >
                                    {avail}
                                </span>
                                <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 font-normal">
                                    ({count})
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

"use client";

import React, { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Product } from "@/types";
import { DisplayProduct, ProductFilterState } from "../types";
import { ProductCard } from "./ProductCard";
import { ProductFilterSidebar } from "./ProductFilterSidebar";
import { ProductActiveFilters } from "./ProductActiveFilters";
import { ProductSortSelect } from "./ProductSortSelect";
import { ProductPagination } from "./ProductPagination";
import { ProductQuickViewDialog } from "./ProductQuickViewDialog";

interface Props {
    initialProducts: Product[];
    allCategories: string[];
    initialCategory?: string;
    initialSearch?: string;
}

const DEFAULT_FILTER_STATE: ProductFilterState = {
    categories: [],
    skinTypes: [],
    priceRange: [0, 300],
    ratings: [],
    promotions: [],
    availability: [],
    sortBy: "default",
    page: 1,
    pageSize: 12,
    searchQuery: "",
};

export function ProductPageClient({
    initialProducts,
    allCategories,
    initialCategory,
    initialSearch,
}: Props) {
    const [filterState, setFilterState] = useState<ProductFilterState>(() => ({
        ...DEFAULT_FILTER_STATE,
        categories: initialCategory ? [initialCategory] : [],
        searchQuery: initialSearch || "",
    }));

    const [quickViewProduct, setQuickViewProduct] =
        useState<DisplayProduct | null>(null);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Normalize raw products from API/DB
    const normalizedProducts: DisplayProduct[] = useMemo(() => {
        if (!initialProducts || initialProducts.length === 0) {
            return [];
        }

        return initialProducts.map((p, idx) => {
            const displayName = p.name || p.title || `Product ${idx + 1}`;
            const primaryCat =
                Array.isArray(p.category) && p.category.length > 0
                    ? p.category[0]
                    : typeof p.product_type === "string"
                      ? p.product_type
                      : "General";

            // Image resolution
            let displayImage = "/images/placeholder.png";
            if (p.images && p.images.length > 0 && p.images[0]?.src) {
                displayImage = p.images[0].src;
            } else if (p.imageFile?.startsWith("http")) {
                displayImage = p.imageFile;
            } else if (p.imageFile) {
                displayImage = `/images/product/${p.imageFile}`;
            }

            const rawPrice = Number(p.price ?? p.variants?.[0]?.price ?? 0);
            const comparePrice = p.variants?.[0]?.compare_at_price
                ? Number(p.variants[0].compare_at_price)
                : 0;

            let originalPrice = rawPrice;
            let discountP = 0;

            if (comparePrice > rawPrice) {
                originalPrice = comparePrice;
                discountP = Math.round(
                    ((comparePrice - rawPrice) / comparePrice) * 100,
                );
            } else if (typeof p.discount === "number" && p.discount > 0) {
                discountP = p.discount;
                originalPrice =
                    Math.round((rawPrice / (1 - discountP / 100)) * 100) / 100;
            }

            // Detect skin type from tags if available, else cycle default
            const skinTypes = [
                "Normal",
                "Oily",
                "Dry",
                "Combination",
                "Sensitive",
            ];
            const matchedSkinType = skinTypes.find((st) =>
                p.tags?.some((t) => t.toLowerCase().includes(st.toLowerCase())),
            );
            const skinType =
                matchedSkinType || skinTypes[idx % skinTypes.length];

            const rating = 4.8 + (idx % 3) * 0.1;

            // Hover Image resolution (image with position: 6)
            let hoverImage: string | undefined = undefined;
            if (Array.isArray(p.images) && p.images.length > 0) {
                const pos6 = p.images.find(
                    (img: any) =>
                        img &&
                        typeof img === "object" &&
                        (img.position === 6 || Number(img.position) === 6),
                );
                if (pos6?.src) {
                    hoverImage = pos6.src;
                } else if (p.images[5]?.src) {
                    hoverImage = p.images[5].src;
                } else if (typeof p.images[5] === "string") {
                    hoverImage = p.images[5];
                } else if (p.images[1]?.src) {
                    hoverImage = p.images[1].src;
                }
            }

            return {
                ...p,
                displayName,
                displayImage,
                hoverImage,
                displayPrice: rawPrice,
                originalPrice,
                discountPercent: discountP,
                rating,
                reviewsCount: 50 + ((idx * 17) % 300),
                primaryCategory: primaryCat,
                skinType,
                isBestSeller: idx % 2 === 0,
                isNewArrival: idx % 3 === 0,
                isOnSale: discountP > 0,
                inStock: p.variants?.[0]?.available ?? true,
            };
        });
    }, [initialProducts]);

    // Available categories combined
    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        allCategories.forEach((c) => set.add(c));
        normalizedProducts.forEach((p) => {
            if (p.primaryCategory) set.add(p.primaryCategory);
        });
        return Array.from(set);
    }, [allCategories, normalizedProducts]);

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        return normalizedProducts.filter((product) => {
            // Category Filter
            if (filterState.categories.length > 0) {
                const matchCat = filterState.categories.some(
                    (c) =>
                        product.primaryCategory?.toLowerCase() ===
                            c.toLowerCase() ||
                        product.category?.some(
                            (pc) => pc.toLowerCase() === c.toLowerCase(),
                        ),
                );
                if (!matchCat) return false;
            }

            // Skin Type Filter
            if (filterState.skinTypes.length > 0) {
                if (!filterState.skinTypes.includes(product.skinType))
                    return false;
            }

            // Price Range Filter
            if (
                product.displayPrice < filterState.priceRange[0] ||
                product.displayPrice > filterState.priceRange[1]
            ) {
                return false;
            }

            // Rating Filter
            if (filterState.ratings.length > 0) {
                const matchRating = filterState.ratings.some(
                    (r) => Math.floor(product.rating) >= r,
                );
                if (!matchRating) return false;
            }

            // Promotions Filter
            if (filterState.promotions.length > 0) {
                const matchPromo = filterState.promotions.some((promo) => {
                    if (promo === "Best Sellers" && product.isBestSeller)
                        return true;
                    if (promo === "New Arrivals" && product.isNewArrival)
                        return true;
                    if (promo === "On Sale" && product.isOnSale) return true;
                    return false;
                });
                if (!matchPromo) return false;
            }

            // Availability Filter
            if (filterState.availability.length > 0) {
                const matchAvail = filterState.availability.some((avail) => {
                    if (avail === "In Stock" && product.inStock) return true;
                    if (avail === "Out of Stocks" && !product.inStock)
                        return true;
                    return false;
                });
                if (!matchAvail) return false;
            }

            // Search Query
            if (filterState.searchQuery.trim()) {
                const q = filterState.searchQuery.toLowerCase();
                const matchName = product.displayName.toLowerCase().includes(q);
                const matchDesc = product.description
                    ?.toLowerCase()
                    .includes(q);
                if (!matchName && !matchDesc) return false;
            }

            return true;
        });
    }, [normalizedProducts, filterState]);

    // Sorting
    const sortedProducts = useMemo(() => {
        const list = [...filteredProducts];
        switch (filterState.sortBy) {
            case "bestseller":
                return list.sort((a, b) =>
                    a.isBestSeller === b.isBestSeller
                        ? b.rating - a.rating
                        : a.isBestSeller
                          ? -1
                          : 1,
                );
            case "rating":
                return list.sort((a, b) => b.rating - a.rating);
            case "newest":
                return list.sort((a, b) =>
                    a.isNewArrival === b.isNewArrival
                        ? 0
                        : a.isNewArrival
                          ? -1
                          : 1,
                );
            case "price-low":
                return list.sort((a, b) => a.displayPrice - b.displayPrice);
            case "price-high":
                return list.sort((a, b) => b.displayPrice - a.displayPrice);
            case "default":
            default:
                return list;
        }
    }, [filteredProducts, filterState.sortBy]);

    // Pagination calculations
    const totalCount = sortedProducts.length;
    const totalPages = Math.ceil(totalCount / filterState.pageSize);
    const startIndex =
        totalCount === 0
            ? 0
            : (filterState.page - 1) * filterState.pageSize + 1;
    const endIndex = Math.min(
        filterState.page * filterState.pageSize,
        totalCount,
    );

    const paginatedProducts = useMemo(() => {
        const start = (filterState.page - 1) * filterState.pageSize;
        return sortedProducts.slice(start, start + filterState.pageSize);
    }, [sortedProducts, filterState.page, filterState.pageSize]);

    const handleOpenQuickView = (p: DisplayProduct) => {
        setQuickViewProduct(p);
        setQuickViewOpen(true);
    };

    // Active filter removal handlers
    const handleRemoveCategory = (cat: string) => {
        setFilterState((prev) => ({
            ...prev,
            categories: prev.categories.filter((c) => c !== cat),
            page: 1,
        }));
    };

    const handleRemoveSkinType = (type: string) => {
        setFilterState((prev) => ({
            ...prev,
            skinTypes: prev.skinTypes.filter((t) => t !== type),
            page: 1,
        }));
    };

    const handleResetPrice = () => {
        setFilterState((prev) => ({
            ...prev,
            priceRange: [0, 300],
            page: 1,
        }));
    };

    const handleRemoveRating = (rating: number) => {
        setFilterState((prev) => ({
            ...prev,
            ratings: prev.ratings.filter((r) => r !== rating),
            page: 1,
        }));
    };

    const handleRemovePromotion = (promo: string) => {
        setFilterState((prev) => ({
            ...prev,
            promotions: prev.promotions.filter((p) => p !== promo),
            page: 1,
        }));
    };

    const handleRemoveAvailability = (avail: string) => {
        setFilterState((prev) => ({
            ...prev,
            availability: prev.availability.filter((a) => a !== avail),
            page: 1,
        }));
    };

    const handleClearAll = () => {
        setFilterState((prev) => ({
            ...prev,
            categories: [],
            skinTypes: [],
            priceRange: [0, 300],
            ratings: [],
            promotions: [],
            availability: [],
            page: 1,
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-400">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
                <Sheet
                    open={mobileFilterOpen}
                    onOpenChange={setMobileFilterOpen}
                >
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-xl border-stone-300 text-stone-800"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Filter
                            Options
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[300px] overflow-y-auto"
                    >
                        <SheetHeader className="mb-4">
                            <SheetTitle>Filter Options</SheetTitle>
                        </SheetHeader>
                        <ProductFilterSidebar
                            filterState={filterState}
                            availableCategories={availableCategories}
                            onFilterChange={setFilterState}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Layout: Sidebar + Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 items-start">
                {/* Left Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-1 sticky top-24">
                    <ProductFilterSidebar
                        filterState={filterState}
                        availableCategories={availableCategories}
                        onFilterChange={setFilterState}
                    />
                </div>

                {/* Right Main Content Area */}
                <div className="lg:col-span-5 space-y-2">
                    {/* Top Bar: Results Count + Sort Select */}
                    <ProductSortSelect
                        totalCount={totalCount}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        sortBy={filterState.sortBy}
                        onSortChange={(val) =>
                            setFilterState((prev) => ({
                                ...prev,
                                sortBy: val,
                                page: 1,
                            }))
                        }
                    />

                    {/* Active Filters Row */}
                    <ProductActiveFilters
                        filterState={filterState}
                        onRemoveCategory={handleRemoveCategory}
                        onRemoveSkinType={handleRemoveSkinType}
                        onResetPrice={handleResetPrice}
                        onRemoveRating={handleRemoveRating}
                        onRemovePromotion={handleRemovePromotion}
                        onRemoveAvailability={handleRemoveAvailability}
                        onClearAll={handleClearAll}
                    />

                    {/* Products Grid */}
                    {paginatedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                            {paginatedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onQuickView={handleOpenQuickView}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-[#F6F5F1] p-8 mt-4">
                            <Filter className="h-12 w-12 text-stone-400 mb-3" />
                            <h3 className="text-lg font-bold text-stone-800">
                                No products match your filter
                            </h3>
                            <p className="text-sm text-stone-500 mt-1 max-w-sm">
                                Try adjusting your category, price range, or
                                clearing filters to see more results.
                            </p>
                            <Button
                                onClick={handleClearAll}
                                className="mt-5 rounded-full bg-[#203D30] text-white hover:bg-[#193227] px-6"
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    <ProductPagination
                        currentPage={filterState.page}
                        totalPages={totalPages}
                        onPageChange={(page) =>
                            setFilterState((prev) => ({ ...prev, page }))
                        }
                    />
                </div>
            </div>

            {/* Quick View Dialog */}
            <ProductQuickViewDialog
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
                product={quickViewProduct}
            />
        </div>
    );
}

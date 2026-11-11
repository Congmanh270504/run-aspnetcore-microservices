"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    allCategories: Array<{ name: string; productCount: number } | string>;
    initialCategory?: string;
    initialSearch?: string;
    initialPriceRange?: [number, number];
}

const DEFAULT_FILTER_STATE: ProductFilterState = {
    categories: [],
    skinTypes: [],
    priceRange: [0, 1000],
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
    totalCount = 0,
    currentPage = 1,
    pageSize = 12,
    allCategories,
    initialCategory,
    initialSearch,
    initialPriceRange,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = React.useTransition();

    const [filterState, setFilterState] = useState<ProductFilterState>(() => ({
        ...DEFAULT_FILTER_STATE,
        categories: initialCategory
            ? initialCategory
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
            : [],
        searchQuery: initialSearch || "",
        page: currentPage,
        pageSize: pageSize,
        priceRange: initialPriceRange || [0, 1000],
    }));

    React.useEffect(() => {
        setFilterState((prev) =>
            prev.page !== currentPage ? { ...prev, page: currentPage } : prev,
        );
    }, [currentPage]);

    React.useEffect(() => {
        setFilterState((prev) => {
            const nextCat = initialCategory
                ? initialCategory
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                : [];
            const isDifferent =
                prev.categories.length !== nextCat.length ||
                prev.categories.some((c, i) => c !== nextCat[i]);
            if (isDifferent) {
                return { ...prev, categories: nextCat };
            }
            return prev;
        });
    }, [initialCategory]);

    React.useEffect(() => {
        if (initialPriceRange) {
            setFilterState((prev) => {
                if (
                    prev.priceRange[0] !== initialPriceRange[0] ||
                    prev.priceRange[1] !== initialPriceRange[1]
                ) {
                    return { ...prev, priceRange: initialPriceRange };
                }
                return prev;
            });
        }
    }, [initialPriceRange?.[0], initialPriceRange?.[1]]);

    // Sync filter changes (priceRange & categories) to URL searchParams
    const isFirstRender = React.useRef(true);
    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const params = new URLSearchParams(
                searchParams ? searchParams.toString() : "",
            );

            const [minP, maxP] = filterState.priceRange;

            if (minP > 0) {
                params.set("minPrice", minP.toString());
            } else {
                params.delete("minPrice");
            }

            if (maxP < 1000) {
                params.set("maxPrice", maxP.toString());
            } else {
                params.delete("maxPrice");
            }

            if (filterState.categories.length > 0) {
                params.set("category", filterState.categories.join(","));
            } else {
                params.delete("category");
            }

            params.delete("page");

            const qs = params.toString();
            const targetUrl = qs ? `${pathname}?${qs}` : pathname;
            const currentUrl = searchParams
                ? `${pathname}?${searchParams.toString()}`
                : pathname;

            if (targetUrl !== currentUrl) {
                startTransition(() => {
                    router.push(targetUrl, { scroll: false });
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [
        filterState.priceRange[0],
        filterState.priceRange[1],
        filterState.categories,
    ]);

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

            const discountAmount =
                typeof p.discount === "number"
                    ? p.discount
                    : p.discount && typeof p.discount === "object"
                      ? Number(p.discount.amount || 0)
                      : 0;

            let originalPrice = rawPrice;
            let displayPrice = rawPrice;
            let discountP = 0;

            if (discountAmount > 0) {
                originalPrice = rawPrice;
                displayPrice = Math.max(0, rawPrice - discountAmount);
                discountP = Math.round((discountAmount / rawPrice) * 100);
            } else if (comparePrice > rawPrice) {
                originalPrice = comparePrice;
                displayPrice = rawPrice;
                discountP = Math.round(
                    ((comparePrice - rawPrice) / comparePrice) * 100,
                );
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
                displayPrice,
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

    // Build real category counts map directly from DB data
    const categoryCountsMap = useMemo(() => {
        const map: Record<string, number> = {};
        allCategories.forEach((c) => {
            if (typeof c === "string") {
                map[c.toLowerCase()] = 0;
            } else if (c && typeof c === "object") {
                map[c.name.toLowerCase()] = c.productCount;
            }
        });
        return map;
    }, [allCategories]);

    // Available categories combined
    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        allCategories.forEach((c) => {
            const name = typeof c === "string" ? c : c.name;
            if (name) set.add(name);
        });
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
                        ) ||
                        product.tags?.some(
                            (t) => t.toLowerCase() === c.toLowerCase(),
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
    const effectiveTotalCount =
        totalCount > 0 ? totalCount : sortedProducts.length;
    const totalPages = Math.max(
        1,
        Math.ceil(effectiveTotalCount / filterState.pageSize),
    );
    const startIndex =
        effectiveTotalCount === 0
            ? 0
            : (filterState.page - 1) * filterState.pageSize + 1;
    const endIndex = Math.min(
        filterState.page * filterState.pageSize,
        effectiveTotalCount,
    );

    const paginatedProducts = useMemo(() => {
        // If the server already returned paginated results (e.g. at most pageSize items)
        if (normalizedProducts.length <= filterState.pageSize) {
            return sortedProducts;
        }
        // Fallback for full client-side dataset
        const start = (filterState.page - 1) * filterState.pageSize;
        return sortedProducts.slice(start, start + filterState.pageSize);
    }, [sortedProducts, normalizedProducts.length, filterState.page, filterState.pageSize]);

    const handlePageChange = (newPage: number) => {
        setFilterState((prev) => ({ ...prev, page: newPage }));
        const params = new URLSearchParams(
            searchParams ? searchParams.toString() : "",
        );
        if (newPage <= 1) {
            params.delete("page");
        } else {
            params.set("page", newPage.toString());
        }
        const qs = params.toString();
        startTransition(() => {
            router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
        });
    };

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
            priceRange: [0, 1000],
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
            priceRange: [0, 1000],
            ratings: [],
            promotions: [],
            availability: [],
            page: 1,
        }));
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-400">
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
                            className="gap-2 rounded-xl border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 dark:bg-card"
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
                            categoryCounts={categoryCountsMap}
                            totalDbCount={effectiveTotalCount}
                            products={normalizedProducts}
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
                        categoryCounts={categoryCountsMap}
                        totalDbCount={effectiveTotalCount}
                        products={normalizedProducts}
                        onFilterChange={setFilterState}
                    />
                </div>

                {/* Right Main Content Area */}
                <div className="lg:col-span-5 space-y-2">
                    {/* Top Bar: Results Count + Sort Select */}
                    <ProductSortSelect
                        totalCount={effectiveTotalCount}
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
                    {isPending ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col justify-between rounded-3xl bg-white dark:bg-card p-3 border border-stone-200/80 dark:border-stone-800 animate-pulse space-y-3"
                                >
                                    <div className="aspect-[4/5] w-full rounded-2xl bg-stone-200 dark:bg-stone-800" />
                                    <div className="space-y-2 px-1 pb-1">
                                        <div className="flex justify-between items-center">
                                            <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
                                            <div className="h-3 w-10 rounded bg-stone-200 dark:bg-stone-800" />
                                        </div>
                                        <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                                        <div className="h-4 w-1/3 rounded bg-stone-200 dark:bg-stone-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedProducts.length > 0 ? (
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
                        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-[#F6F5F1] dark:bg-card dark:border dark:border-border/60 p-8 mt-4">
                            <Filter className="h-12 w-12 text-stone-400 dark:text-stone-500 mb-3" />
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                                No products match your filter
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
                                Try adjusting your category, price range, or
                                clearing filters to see more results.
                            </p>
                            <Button
                                onClick={handleClearAll}
                                className="mt-5 rounded-full bg-[#203D30] dark:bg-emerald-700 text-white hover:bg-[#193227] dark:hover:bg-emerald-600 px-6"
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    <ProductPagination
                        currentPage={filterState.page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
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

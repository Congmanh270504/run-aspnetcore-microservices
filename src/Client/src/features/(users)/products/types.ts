import { Product } from "@/types";

export interface DisplayProduct extends Product {
    displayName: string;
    displayImage: string;
    hoverImage?: string;
    displayPrice: number;
    originalPrice: number;
    discountPercent: number;
    rating: number;
    reviewsCount: number;
    primaryCategory: string;
    skinType: string;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isOnSale: boolean;
    inStock: boolean;
}

export type SortOption =
    | "default"
    | "bestseller"
    | "rating"
    | "newest"
    | "price-low"
    | "price-high";

export interface ProductFilterState {
    categories: string[];
    skinTypes: string[];
    priceRange: [number, number];
    ratings: number[];
    promotions: string[];
    availability: string[];
    sortBy: SortOption;
    page: number;
    pageSize: number;
    searchQuery: string;
}

export interface FilterOptionItem {
    id: string;
    label: string;
    count?: number;
}

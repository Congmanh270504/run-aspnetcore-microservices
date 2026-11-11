import React from "react";
import { Metadata } from "next";
import {
    getUserProductsWithCount,
    getUserCategories,
    getUserProductsByCategoryWithCount,
} from "@/features/(users)/products/actions/productActions";
import { getDiscounts } from "@/features/(admin)/discounts/actions/discountActions";
import { ProductPageClient } from "@/features/(users)/products/components/ProductPageClient";

export const revalidate = 0;

export const metadata: Metadata = {
    title: "All Products - Exclusive Skincare & Cosmetics",
    description:
        "Discover premium skincare, makeup, and hair care products with natural ingredients and visible results.",
};

interface Props {
    searchParams?: {
        category?: string;
        search?: string;
        page?: string;
        minPrice?: string;
        maxPrice?: string;
    };
}

export default async function ProductsPage({ searchParams }: Props) {
    const selectedCategory = searchParams?.category;
    const searchQuery = searchParams?.search;
    const currentPage = Math.max(1, parseInt(searchParams?.page || "1", 10));
    const pageSize = 12;

    const minPrice =
        searchParams?.minPrice !== undefined &&
        !isNaN(Number(searchParams.minPrice))
            ? Number(searchParams.minPrice)
            : undefined;

    const maxPrice =
        searchParams?.maxPrice !== undefined &&
        !isNaN(Number(searchParams.maxPrice))
            ? Number(searchParams.maxPrice)
            : undefined;

    const [allCategories, productsResult, discounts] = await Promise.all([
        getUserCategories(),
        selectedCategory
            ? getUserProductsByCategoryWithCount(
                  selectedCategory,
                  currentPage,
                  pageSize,
                  minPrice,
                  maxPrice,
              )
            : getUserProductsWithCount(
                  currentPage,
                  pageSize,
                  minPrice,
                  maxPrice,
              ),
        getDiscounts().catch(() => []),
    ]);

    const discountsMap = new Map<string, number>();
    discounts.forEach((d) => {
        if (d.productName) {
            discountsMap.set(d.productName.toLowerCase(), d.amount);
        }
    });

    const initialProducts = productsResult.products.map((p) => {
        const name = (p.name || p.title || "").toLowerCase();
        const discountAmount = discountsMap.get(name);
        if (discountAmount !== undefined) {
            return { ...p, discount: discountAmount };
        }
        return p;
    });

    const initialPriceRange: [number, number] = [
        minPrice ?? 0,
        maxPrice ?? 1000,
    ];

    return (
        <ProductPageClient
            initialProducts={initialProducts}
            totalCount={productsResult.totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            allCategories={allCategories}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            initialPriceRange={initialPriceRange}
        />
    );
}

import React from "react";
import { Metadata } from "next";
import {
    getUserProducts,
    getUserCategories,
    getUserProductsByCategory,
} from "@/features/(users)/products/actions/productActions";
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
    };
}

export default async function ProductsPage({ searchParams }: Props) {
    const selectedCategory = searchParams?.category;
    const searchQuery = searchParams?.search;

    const [allCategories, initialProducts] = await Promise.all([
        getUserCategories(),
        selectedCategory
            ? getUserProductsByCategory(selectedCategory)
            : getUserProducts(1, 100),
    ]);

    return (
        <ProductPageClient
            initialProducts={initialProducts}
            allCategories={allCategories}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
        />
    );
}

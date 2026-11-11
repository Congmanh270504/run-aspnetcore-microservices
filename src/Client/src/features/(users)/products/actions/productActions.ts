"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import type { GetProductByIdResponse, Product } from "@/types";

export interface PaginatedProductsResult {
    products: Product[];
    totalCount: number;
}

export async function getTotalProductsCount(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
): Promise<number> {
    const params = new URLSearchParams();
    if (minPrice !== undefined && minPrice !== null)
        params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined && maxPrice !== null)
        params.set("maxPrice", maxPrice.toString());
    const qs = params.toString() ? `?${params.toString()}` : "";

    const endpoint = category
        ? `/catalog-service/products/category/${encodeURIComponent(category)}/count${qs}`
        : `/catalog-service/products/count${qs}`;
    const gatewayRes = await fetchFromGateway<{ totalCount: number }>(endpoint);
    if (
        typeof gatewayRes?.totalCount === "number" &&
        gatewayRes.totalCount > 0
    ) {
        return gatewayRes.totalCount;
    }

    return 0;
}

export async function getUserProductsWithCount(
    pageNumber: number = 1,
    pageSize: number = 12,
    minPrice?: number,
    maxPrice?: number,
): Promise<PaginatedProductsResult> {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });
    if (minPrice !== undefined && minPrice !== null)
        params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined && maxPrice !== null)
        params.set("maxPrice", maxPrice.toString());

    const gatewayResult = await fetchFromGateway<any>(
        `/catalog-service/products?${params.toString()}`,
    );
    if (gatewayResult?.products && gatewayResult.products.length > 0) {
        let total = gatewayResult.totalCount ?? gatewayResult.TotalCount;
        if (typeof total !== "number") {
            const count = await getTotalProductsCount(
                undefined,
                minPrice,
                maxPrice,
            );
            if (count > 0) total = count;
        }
        return {
            products: gatewayResult.products,
            totalCount: total ?? gatewayResult.products.length,
        };
    }

    return { products: [], totalCount: 0 };
}

export async function getUserProducts(
    pageNumber: number = 1,
    pageSize: number = 100,
): Promise<Product[]> {
    const res = await getUserProductsWithCount(pageNumber, pageSize);
    return res.products;
}

export async function getUserProductById(id: string): Promise<Product | null> {
    const gatewayResult = await fetchFromGateway<GetProductByIdResponse>(
        `/catalog-service/products/${id}`,
    );
    if (gatewayResult?.product) {
        return gatewayResult.product;
    }

    return null;
}

export async function getProductColorVariants(
    title?: string,
    id?: string,
): Promise<Product[]> {
    if (!title && !id) return [];
    try {
        const params = new URLSearchParams();
        if (title) params.set("title", title);
        if (id) params.set("id", id);

        const gatewayResult = await fetchFromGateway<{ products: Product[] }>(
            `/catalog-service/products/color-variants?${params.toString()}`,
        );
        if (gatewayResult?.products && Array.isArray(gatewayResult.products)) {
            return gatewayResult.products;
        }
    } catch (e) {
        console.error("Error fetching color variants:", e);
    }
    return [];
}

export async function getUserProductsByCategoryWithCount(
    category: string,
    pageNumber: number = 1,
    pageSize: number = 12,
    minPrice?: number,
    maxPrice?: number,
): Promise<PaginatedProductsResult> {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });
    if (minPrice !== undefined && minPrice !== null)
        params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined && maxPrice !== null)
        params.set("maxPrice", maxPrice.toString());

    const gatewayResult = await fetchFromGateway<any>(
        `/catalog-service/products/category/${encodeURIComponent(category)}?${params.toString()}`,
    );
    if (gatewayResult?.products && gatewayResult.products.length > 0) {
        let total = gatewayResult.totalCount ?? gatewayResult.TotalCount;
        if (typeof total !== "number") {
            const count = await getTotalProductsCount(
                category,
                minPrice,
                maxPrice,
            );
            if (count > 0) total = count;
        }
        return {
            products: gatewayResult.products,
            totalCount: total ?? gatewayResult.products.length,
        };
    }

    return { products: [], totalCount: 0 };
}

export async function getUserProductsByCategory(
    category: string,
): Promise<Product[]> {
    const res = await getUserProductsByCategoryWithCount(category, 1, 100);
    return res.products;
}

export interface UserCategoryItem {
    name: string;
    productCount: number;
}

export async function getUserCategories(): Promise<UserCategoryItem[]> {
    const gatewayRes = await fetchFromGateway<{
        categories: UserCategoryItem[];
    }>("/catalog-service/categories");
    if (gatewayRes?.categories && gatewayRes.categories.length > 0) {
        return gatewayRes.categories;
    }

    const products = await getUserProducts(1, 100);
    const categoryMap = new Map<string, number>();

    products.forEach((p) => {
        if (Array.isArray(p.category) && p.category.length > 0) {
            p.category.forEach((c) => {
                if (c && c.trim()) {
                    const trimmed = c.trim();
                    categoryMap.set(trimmed, (categoryMap.get(trimmed) ?? 0) + 1);
                }
            });
        } else if (
            typeof p.product_type === "string" &&
            p.product_type.trim()
        ) {
            const trimmed = p.product_type.trim();
            categoryMap.set(trimmed, (categoryMap.get(trimmed) ?? 0) + 1);
        }
    });

    return Array.from(categoryMap.entries()).map(([name, productCount]) => ({
        name,
        productCount,
    }));
}

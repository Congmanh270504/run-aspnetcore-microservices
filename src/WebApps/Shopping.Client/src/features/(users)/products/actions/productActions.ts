"use server";

import { fetchFromGateway, fetchDirect } from "@/lib/gatewayClient";
import type {
    Product,
    GetProductsResponse,
    GetProductByIdResponse,
    GetProductByCategoryResponse,
} from "@/types";

const CATALOG_URL = process.env.CATALOG_API_URL || "http://localhost:56258";

export async function getUserProducts(
    pageNumber: number = 1,
    pageSize: number = 100,
): Promise<Product[]> {
    // 1. Try YARP Gateway first
    const gatewayResult = await fetchFromGateway<GetProductsResponse>(
        `/catalog-service/products?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    if (gatewayResult?.products && gatewayResult.products.length > 0) {
        return gatewayResult.products;
    }

    // 2. Fallback to direct Catalog.API
    const directResult = await fetchDirect<GetProductsResponse>(
        CATALOG_URL,
        `/products?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return directResult?.products || [];
}

export async function getUserProductById(id: string): Promise<Product | null> {
    const gatewayResult = await fetchFromGateway<GetProductByIdResponse>(
        `/catalog-service/products/${id}`,
    );
    if (gatewayResult?.product) {
        return gatewayResult.product;
    }

    const directResult = await fetchDirect<GetProductByIdResponse>(
        CATALOG_URL,
        `/products/${id}`,
    );
    return directResult?.product || null;
}

export async function getUserProductsByCategory(
    category: string,
): Promise<Product[]> {
    const gatewayResult = await fetchFromGateway<GetProductByCategoryResponse>(
        `/catalog-service/products/category/${encodeURIComponent(category)}`,
    );
    if (gatewayResult?.products && gatewayResult.products.length > 0) {
        return gatewayResult.products;
    }

    const directResult = await fetchDirect<GetProductByCategoryResponse>(
        CATALOG_URL,
        `/products/category/${encodeURIComponent(category)}`,
    );
    return directResult?.products || [];
}

export async function getUserCategories(): Promise<string[]> {
    const products = await getUserProducts(1, 100);
    const categorySet = new Set<string>();

    products.forEach((p) => {
        if (Array.isArray(p.category) && p.category.length > 0) {
            p.category.forEach((c) => {
                if (c && c.trim()) categorySet.add(c.trim());
            });
        } else if (typeof p.product_type === "string" && p.product_type.trim()) {
            categorySet.add(p.product_type.trim());
        }
    });

    return Array.from(categorySet);
}

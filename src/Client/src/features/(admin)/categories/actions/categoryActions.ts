"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import { revalidatePath } from "next/cache";
import { getProducts } from "../../products/actions/catalogActions";

export interface CategoryRow {
    name: string;
    productCount: number;
}

export interface ProductTypeRow {
    name: string;
    productCount: number;
}

// ─── Read Categories ────────────────────────────────────────────────────────────

export async function getCategoryRows(): Promise<CategoryRow[]> {
    try {
        const gatewayRes = await fetchFromGateway<{ categories: CategoryRow[] }>(
            "/catalog-service/categories",
        );
        if (gatewayRes?.categories && gatewayRes.categories.length > 0) {
            return gatewayRes.categories;
        }
    } catch {
        // Fallback to reading from products
    }

    // Fallback: aggregate from products
    const products = await getProducts(1, 500);
    const map = new Map<string, number>();
    products.forEach((p) => {
        p.category?.forEach((cat) => {
            if (cat && cat.trim()) {
                const trimmed = cat.trim();
                map.set(trimmed, (map.get(trimmed) ?? 0) + 1);
            }
        });
    });
    return Array.from(map.entries())
        .map(([name, productCount]) => ({ name, productCount }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Create Category ───────────────────────────────────────────────────────────

export async function createCategory(
    name: string,
): Promise<{ success: boolean; error?: string }> {
    const trimmed = name.trim();
    if (!trimmed) {
        return { success: false, error: "Category name cannot be empty" };
    }

    try {
        const body = JSON.stringify({ name: trimmed });
        const res = await fetchFromGateway<{ category: CategoryRow }>(
            "/catalog-service/categories",
            { method: "POST", body },
        );
        if (res) {
            revalidatePath("/admin/categories");
            return { success: true };
        }
        return { success: false, error: "Failed to create category" };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to create category",
        };
    }
}

// ─── Rename Category ───────────────────────────────────────────────────────────

export async function renameCategory(
    oldName: string,
    newName: string,
): Promise<{ success: boolean; error?: string }> {
    const trimmed = newName.trim();
    if (!trimmed)
        return { success: false, error: "Category name cannot be empty" };
    if (trimmed === oldName) return { success: true };

    try {
        const body = JSON.stringify({ oldName, newName: trimmed });
        const res = await fetchFromGateway<{ isSuccess: boolean }>(
            "/catalog-service/categories",
            { method: "PUT", body },
        );
        if (res) {
            revalidatePath("/admin/categories");
            revalidatePath("/admin/products");
            return { success: true };
        }
        return { success: false, error: "Failed to rename category" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// ─── Delete Category ───────────────────────────────────────────────────────────

export async function deleteCategory(
    name: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const encoded = encodeURIComponent(name);
        const res = await fetchFromGateway<{ isSuccess: boolean }>(
            `/catalog-service/categories/${encoded}`,
            { method: "DELETE" },
        );
        if (res) {
            revalidatePath("/admin/categories");
            revalidatePath("/admin/products");
            return { success: true };
        }
        return { success: false, error: "Failed to delete category" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// ─── Read Product Types ─────────────────────────────────────────────────────────

export async function getProductTypeRows(): Promise<ProductTypeRow[]> {
    try {
        const gatewayRes = await fetchFromGateway<{ productTypes: ProductTypeRow[] }>(
            "/catalog-service/product-types",
        );
        if (gatewayRes?.productTypes && gatewayRes.productTypes.length > 0) {
            return gatewayRes.productTypes;
        }
    } catch {
        // Fallback to reading from products
    }

    // Fallback: aggregate from products
    const products = await getProducts(1, 500);
    const map = new Map<string, number>();
    products.forEach((p) => {
        let typeName = "";
        if (typeof p.product_type === "string") {
            typeName = p.product_type;
        } else if (p.product_type && typeof p.product_type === "object" && "name" in p.product_type) {
            typeName = p.product_type.name || "";
        }
        if (typeName.trim()) {
            const name = typeName.trim();
            map.set(name, (map.get(name) ?? 0) + 1);
        }
    });
    return Array.from(map.entries())
        .map(([name, productCount]) => ({ name, productCount }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Create Product Type ───────────────────────────────────────────────────────

export async function createProductType(
    name: string,
): Promise<{ success: boolean; error?: string }> {
    const trimmed = name.trim();
    if (!trimmed) {
        return { success: false, error: "Product type name cannot be empty" };
    }

    try {
        const body = JSON.stringify({ name: trimmed });
        const res = await fetchFromGateway<{ productType: ProductTypeRow }>(
            "/catalog-service/product-types",
            { method: "POST", body },
        );
        if (res) {
            revalidatePath("/admin/categories");
            return { success: true };
        }
        return { success: false, error: "Failed to create product type" };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to create product type",
        };
    }
}

// ─── Rename Product Type ───────────────────────────────────────────────────────

export async function renameProductType(
    oldName: string,
    newName: string,
): Promise<{ success: boolean; error?: string }> {
    const trimmed = newName.trim();
    if (!trimmed)
        return { success: false, error: "Product type name cannot be empty" };
    if (trimmed === oldName) return { success: true };

    try {
        const body = JSON.stringify({ oldName, newName: trimmed });
        const res = await fetchFromGateway<{ isSuccess: boolean }>(
            "/catalog-service/product-types",
            { method: "PUT", body },
        );
        if (res) {
            revalidatePath("/admin/categories");
            revalidatePath("/admin/products");
            return { success: true };
        }
        return { success: false, error: "Failed to rename product type" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// ─── Delete Product Type ───────────────────────────────────────────────────────

export async function deleteProductType(
    name: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const encoded = encodeURIComponent(name);
        const res = await fetchFromGateway<{ isSuccess: boolean }>(
            `/catalog-service/product-types/${encoded}`,
            { method: "DELETE" },
        );
        if (res) {
            revalidatePath("/admin/categories");
            revalidatePath("/admin/products");
            return { success: true };
        }
        return { success: false, error: "Failed to delete product type" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

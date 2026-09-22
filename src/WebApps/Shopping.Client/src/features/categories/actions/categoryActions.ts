"use server";

import { fetchFromGateway, fetchDirect } from "@/lib/gatewayClient";
import { getProducts } from "@/features/products/actions/catalogActions";
import { revalidatePath } from "next/cache";

const CATALOG_URL = process.env.CATALOG_API_URL || "http://localhost:56258";

export interface CategoryRow {
    name: string;
    productCount: number;
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getCategoryRows(): Promise<CategoryRow[]> {
    const products = await getProducts(1, 500);
    const map = new Map<string, number>();
    products.forEach((p) => {
        p.category?.forEach((cat) => {
            map.set(cat, (map.get(cat) ?? 0) + 1);
        });
    });
    return Array.from(map.entries())
        .map(([name, productCount]) => ({ name, productCount }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Rename ────────────────────────────────────────────────────────────────────
// Renames a category across ALL products that use it

export async function renameCategory(
    oldName: string,
    newName: string,
): Promise<{ success: boolean; error?: string }> {
    const trimmed = newName.trim();
    if (!trimmed)
        return { success: false, error: "Category name cannot be empty" };
    if (trimmed === oldName) return { success: true };

    try {
        const products = await getProducts(1, 500);
        const affected = products.filter((p) => p.category?.includes(oldName));

        const results = await Promise.allSettled(
            affected.map((p) => {
                const updatedCategory = p.category.map((c) =>
                    c === oldName ? trimmed : c,
                );
                const body = JSON.stringify({
                    ...p,
                    category: updatedCategory,
                });

                const tryGateway = fetchFromGateway<{ isSuccess: boolean }>(
                    `/catalog-service/products`,
                    { method: "PUT", body },
                );
                const tryDirect = () =>
                    fetchDirect<{ isSuccess: boolean }>(
                        CATALOG_URL,
                        `/products`,
                        {
                            method: "PUT",
                            body,
                        },
                    );

                return tryGateway.then((res) => res ?? tryDirect());
            }),
        );

        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
            return {
                success: false,
                error: `${failed} product(s) could not be updated`,
            };
        }

        revalidatePath("/admin/categories");
        revalidatePath("/admin/products");
        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// ─── Delete ────────────────────────────────────────────────────────────────────
// Removes a category tag from ALL products that use it

export async function deleteCategory(
    name: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const products = await getProducts(1, 500);
        const affected = products.filter((p) => p.category?.includes(name));

        const results = await Promise.allSettled(
            affected.map((p) => {
                const updatedCategory = p.category.filter((c) => c !== name);
                const body = JSON.stringify({
                    ...p,
                    category: updatedCategory,
                });

                const tryGateway = fetchFromGateway<{ isSuccess: boolean }>(
                    `/catalog-service/products`,
                    { method: "PUT", body },
                );
                const tryDirect = () =>
                    fetchDirect<{ isSuccess: boolean }>(
                        CATALOG_URL,
                        `/products`,
                        {
                            method: "PUT",
                            body,
                        },
                    );

                return tryGateway.then((res) => res ?? tryDirect());
            }),
        );

        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
            return {
                success: false,
                error: `${failed} product(s) could not be updated`,
            };
        }

        revalidatePath("/admin/categories");
        revalidatePath("/admin/products");
        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

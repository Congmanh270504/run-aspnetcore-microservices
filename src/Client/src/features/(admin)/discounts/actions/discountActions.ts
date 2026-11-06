"use server";

import { fetchFromGateway, fetchDirect } from "@/lib/gatewayClient";
import { revalidatePath } from "next/cache";
import type { Coupon, CreateCouponData, UpdateCouponData } from "@/types";

const BASE_PATH = "/discount-service/discounts";
const DISCOUNT_URL = process.env.DISCOUNT_API_URL || "http://localhost:6002";

export async function getDiscounts(): Promise<Coupon[]> {
    const res = await fetchFromGateway<Coupon[]>(BASE_PATH);
    if (res && Array.isArray(res)) return res;

    const fallback = await fetchDirect<Coupon[]>(
        DISCOUNT_URL,
        "/discounts"
    );
    return (fallback && Array.isArray(fallback)) ? fallback : [];
}

export async function getDiscountByProductName(productName: string): Promise<Coupon | null> {
    const encodedName = encodeURIComponent(productName);
    const res = await fetchFromGateway<Coupon>(`${BASE_PATH}/${encodedName}`);
    if (res) return res;

    const fallback = await fetchDirect<Coupon>(
        DISCOUNT_URL,
        `/discounts/${encodedName}`
    );
    return fallback;
}

export async function createDiscount(
    data: CreateCouponData
): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
        let res = await fetchFromGateway<Coupon>(BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!res) {
            res = await fetchDirect<Coupon>(
                DISCOUNT_URL,
                "/discounts",
                {
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );
        }

        if (res) {
            revalidatePath("/admin/discounts");
            return { success: true, id: res.id ?? (res as any).Id };
        }
        return { success: false, error: "Failed to create discount coupon" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

export async function updateDiscount(
    data: UpdateCouponData
): Promise<{ success: boolean; error?: string }> {
    try {
        let res = await fetchFromGateway<Coupon>(BASE_PATH, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        if (!res) {
            res = await fetchDirect<Coupon>(
                DISCOUNT_URL,
                "/discounts",
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                }
            );
        }

        if (res) {
            revalidatePath("/admin/discounts");
            return { success: true };
        }
        return { success: false, error: "Failed to update discount coupon" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

export async function deleteDiscount(
    id: number,
    productName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        let res = await fetchFromGateway<{ isSuccess: boolean }>(`${BASE_PATH}/${id}`, {
            method: "DELETE",
        });

        if (!res) {
            const encodedName = encodeURIComponent(productName);
            res = await fetchFromGateway<{ isSuccess: boolean }>(`${BASE_PATH}/${encodedName}`, {
                method: "DELETE",
            });
        }

        if (!res) {
            res = await fetchDirect<{ isSuccess: boolean }>(
                DISCOUNT_URL,
                `/discounts/${id}`,
                {
                    method: "DELETE",
                }
            );
        }

        if (res) {
            revalidatePath("/admin/discounts");
            return { success: true };
        }
        return { success: false, error: "Failed to delete discount coupon" };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

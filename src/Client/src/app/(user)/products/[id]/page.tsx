import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/features/(users)/products/components/ProductDetailClient";
import { ProductDetailSkeleton } from "@/features/(users)/products/components/ProductDetailSkeleton";
import {
    getUserProductById,
    getUserProducts,
    getProductColorVariants,
} from "@/features/(users)/products/actions/productActions";
import { getProductById } from "@/features/(admin)/products/actions/catalogActions";
import { getDiscountByProductName } from "@/features/(admin)/discounts/actions/discountActions";

export const revalidate = 0;

interface Props {
    params: {
        id: string;
    };
}

async function ProductDetailContent({ id }: { id: string }) {
    const product =
        (await getUserProductById(id).catch(() => null)) ||
        (await getProductById(id).catch(() => null));

    if (!product) {
        notFound();
    }

    const coupon = await getDiscountByProductName(
        product.name || product.title || "",
    ).catch(() => null);
    if (coupon && coupon.amount > 0) {
        product.discount = coupon.amount;
    }

    // Fetch up to 10 products with the same product_type as current product
    const allProducts = await getUserProducts(1, 100).catch(() => []);
    const currentProductType =
        (typeof product.product_type === "string" && product.product_type) ||
        (typeof product.productType === "string" && product.productType) ||
        (Array.isArray(product.category) && product.category[0]) ||
        "";

    let matchingProducts = allProducts.filter((p) => {
        if (p.id === product.id) return false;
        const pType =
            (typeof p.product_type === "string" && p.product_type) ||
            (typeof p.productType === "string" && p.productType) ||
            (Array.isArray(p.category) && p.category[0]) ||
            "";
        return (
            currentProductType &&
            pType &&
            pType.trim().toLowerCase() === currentProductType.trim().toLowerCase()
        );
    });

    if (matchingProducts.length < 10) {
        const others = allProducts.filter(
            (p) =>
                p.id !== product.id &&
                !matchingProducts.some((m) => m.id === p.id),
        );
        matchingProducts = [...matchingProducts, ...others].slice(0, 10);
    } else {
        matchingProducts = matchingProducts.slice(0, 10);
    }

    const currentTitle = product.name || product.title || "";
    let colorVariants = await getProductColorVariants(
        currentTitle,
        product.id,
    ).catch(() => []);

    if (colorVariants.length <= 1 && currentTitle) {
        const lastDash = currentTitle.lastIndexOf("-");
        if (lastDash !== -1) {
            const baseTitle = currentTitle
                .substring(0, lastDash)
                .trim()
                .toLowerCase();
            const localMatches = allProducts.filter((p) => {
                const pTitle = (p.name || p.title || "").toLowerCase();
                const pDash = pTitle.lastIndexOf("-");
                if (pDash === -1) return false;
                return pTitle.substring(0, pDash).trim() === baseTitle;
            });
            if (localMatches.length > 0) {
                if (!localMatches.some((m) => m.id === product.id)) {
                    localMatches.push(product);
                }
                colorVariants = localMatches;
            }
        }
    }

    if (colorVariants.length === 0) {
        colorVariants = [product];
    }

    return (
        <ProductDetailClient
            product={product}
            popularProducts={matchingProducts}
            colorVariants={colorVariants}
        />
    );
}

export default function ProductDetailPage({ params }: Props) {
    return (
        <div className="container p-8 space-y-6">
            <Suspense fallback={<ProductDetailSkeleton />}>
                <ProductDetailContent id={params.id} />
            </Suspense>
        </div>
    );
}

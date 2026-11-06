import React, { Suspense } from "react";

import Loading from "./loading";
import { getDiscounts } from "@/features/(admin)/discounts/actions/discountActions";
import { getProducts } from "@/features/(admin)/products/actions/catalogActions";
import { DiscountPageClient } from "@/features/(admin)/discounts/components/DiscountPageClient";

export const revalidate = 0;

export const metadata = {
    title: "Manage Discounts - Admin Portal",
};

async function DiscountPageDataFetcher() {
    const [discounts, products] = await Promise.all([
        getDiscounts(),
        getProducts(1, 200),
    ]);

    return <DiscountPageClient data={discounts} products={products} />;
}

export default function AdminDiscountsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <DiscountPageDataFetcher />
        </Suspense>
    );
}


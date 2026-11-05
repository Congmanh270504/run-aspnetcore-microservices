import React, { Suspense } from "react";

import Loading from "./loading";
import { getProducts } from "@/features/(admin)/products/actions/catalogActions";
import { getDiscounts } from "@/features/(admin)/discounts/actions/discountActions";
import { ProductsPageClient } from "@/features/(admin)/products/components/ProductsPageClient";

export const revalidate = 0;

export const metadata = {
    title: "Manage Products - Admin Portal",
};

async function ProductsPageDataFetcher() {
    const [products, discounts] = await Promise.all([
        getProducts(1, 100),
        getDiscounts().catch(() => []),
    ]);
    return <ProductsPageClient data={products} discounts={discounts} />;
}

export default function AdminProductsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ProductsPageDataFetcher />
        </Suspense>
    );
}

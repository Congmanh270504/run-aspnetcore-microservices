import React, { Suspense } from "react";

import Loading from "./loading";
import { getProducts } from "@/features/(admin)/products/actions/catalogActions";
import { ProductsPageClient } from "@/features/(admin)/products/components/ProductsPageClient";

export const revalidate = 0;

export const metadata = {
    title: "Manage Products - Admin Portal",
};

async function ProductsPageDataFetcher() {
    const products = await getProducts(1, 100);
    return <ProductsPageClient data={products} />;
}

export default function AdminProductsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ProductsPageDataFetcher />
        </Suspense>
    );
}

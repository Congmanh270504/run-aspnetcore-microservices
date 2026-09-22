import React, { Suspense } from "react";
import { getProducts } from "@/features/products/actions/catalogActions";
import { ProductsPageClient } from "@/features/products/components/ProductsPageClient";
import Loading from "./loading";

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

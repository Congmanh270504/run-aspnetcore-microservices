import React, { Suspense } from "react";
import { CartPageClient } from "@/features/(users)/cart";
import CartLoading from "./loading";

export const metadata = {
    title: "Your Shopping Cart - EShop Microservices",
};

export default function CartPage() {
    return (
        <Suspense fallback={<CartLoading />}>
            <div className="container p-8 space-y-6">
                <CartPageClient />
            </div>
        </Suspense>
    );
}

import React, { Suspense } from "react";
import { CheckoutForm } from "@/features/(users)/cart";
import CheckoutLoading from "./loading";

export const metadata = {
    title: "Checkout - EShop Microservices",
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <div className="container p-8 space-y-6">
                <CheckoutForm />
            </div>
        </Suspense>
    );
}

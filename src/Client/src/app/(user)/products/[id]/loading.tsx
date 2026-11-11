import React from "react";
import { ProductDetailSkeleton } from "@/features/(users)/products/components/ProductDetailSkeleton";

export default function Loading() {
    return (
        <div className="container p-8 space-y-6">
            <ProductDetailSkeleton />
        </div>
    );
}

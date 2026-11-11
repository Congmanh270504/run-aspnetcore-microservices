"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./AddToCartButton";

interface Props {
    product: Product;
}

export function ProductCard({ product }: Props) {
    const imageUrl = product.imageFile?.startsWith("http")
        ? product.imageFile
        : product.imageFile
          ? `/images/product/${product.imageFile}`
          : "/images/placeholder.png";

    const displayName = product.name || product.title || "Product";
    const displayDesc =
        product.description || product.body_html || "No description provided.";

    const rawPrice = Number(product.price ?? product.variants?.[0]?.price ?? 0);

    const discountAmount =
        typeof product.discount === "number"
            ? product.discount
            : product.discount && typeof product.discount === "object"
              ? Number(product.discount.amount || 0)
              : 0;

    const compareAtPrice = product.variants?.[0]?.compare_at_price
        ? Number(product.variants[0].compare_at_price)
        : 0;

    let originalPrice = rawPrice;
    let finalPrice = rawPrice;
    let hasDiscount = false;

    if (discountAmount > 0) {
        hasDiscount = true;
        originalPrice = rawPrice;
        finalPrice = Math.max(0, rawPrice - discountAmount);
    } else if (compareAtPrice > rawPrice) {
        hasDiscount = true;
        originalPrice = compareAtPrice;
        finalPrice = rawPrice;
    }

    return (
        <Card className="group overflow-hidden flex flex-col justify-between border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <Link
                href={`/products/${product.id}`}
                className="block relative overflow-hidden bg-slate-100 dark:bg-slate-800/60 aspect-square"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageUrl}
                    alt={displayName}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "/images/placeholder.png";
                    }}
                />
                {product.category && product.category.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.category.slice(0, 2).map((cat) => (
                            <Badge
                                key={cat}
                                variant="secondary"
                                className="text-[11px] font-medium opacity-90 shadow-sm"
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                )}
                {hasDiscount && (
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold shadow-sm">
                            {discountAmount > 0
                                ? `-$${discountAmount}`
                                : `Save $${(originalPrice - finalPrice).toFixed(0)}`}
                        </Badge>
                    </div>
                )}
            </Link>

            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {displayName}
                        </h3>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {displayDesc}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/20">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">
                        Price
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                            ${finalPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                ${originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
                <AddToCartButton
                    product={{
                        ...product,
                        price: finalPrice,
                    }}
                />
            </CardFooter>
        </Card>
    );
}

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
    const displayPrice = Number(
        product.price ?? product.variants?.[0]?.price ?? 0,
    );

    return (
        <Card className="group overflow-hidden flex flex-col justify-between border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <Link
                href={`/products/${product.id}`}
                className="block relative overflow-hidden bg-slate-100 aspect-square"
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
                    <span className="text-lg font-bold text-emerald-600">
                        ${Number(product.price).toFixed(2)}
                    </span>
                </div>
                <AddToCartButton product={product} />
            </CardFooter>
        </Card>
    );
}

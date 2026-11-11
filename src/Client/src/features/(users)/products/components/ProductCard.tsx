"use client";

import { Button } from "@/components/ui/button";
import { Maximize2, ShoppingCartIcon, Star } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { DisplayProduct } from "../types";
import Image from "next/image";

interface Props {
    product: DisplayProduct;
    onQuickView: (product: DisplayProduct) => void;
}

export function ProductCard({ product, onQuickView }: Props) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView(product);
    };

    return (
        <div className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-card dark:border dark:border-border/60 p-2 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/40 dark:hover:border-border">
            {/* Image Container with Warm Aesthetic Background */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F6F5F1] dark:bg-slate-800/60 transition-colors">
                <Link
                    href={`/products/${product.id}`}
                    className="relative block h-full w-full overflow-hidden"
                >
                    {/* Primary Image */}
                    <Image
                        src={product.displayImage}
                        alt={product.displayName}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                            product.hoverImage ? "group-hover:opacity-0" : ""
                        }`}
                        fill
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "/images/placeholder.png";
                        }}
                    />

                    {/* Hover Image (Position: 6) */}
                    {product.hoverImage && (
                        <Image
                            src={product.hoverImage}
                            alt={`${product.displayName} alternate view`}
                            fill
                            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                    "none";
                            }}
                        />
                    )}
                </Link>

                {/* Top-Left Discount Badge */}
                {product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                            {product.discountPercent}% off
                        </span>
                    </div>
                )}

                {/* Top-Right Vertical Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1.5 opacity-90 transition-all duration-300 group-hover:opacity-100">
                    {/* Quick View Button */}
                    <button
                        type="button"
                        onClick={handleQuickView}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-200 shadow-md transition-all hover:scale-110 hover:text-stone-900 dark:hover:text-white dark:border dark:border-slate-700/60"
                        title="Quick View"
                        aria-label="Quick View"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Product Meta & Details */}
            <div className="flex flex-1 flex-col justify-between pt-3 pb-1 px-1">
                <div>
                    {/* Category & Rating Row */}
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        {/* Product Name */}
                        <Link
                            href={`/products/${product.id}`}
                            className="mt-1 block"
                        >
                            <h3 className="line-clamp-1 text-sm font-playfair text-stone-900 dark:text-stone-100 transition-colors group-hover:text-[#203D30] dark:group-hover:text-emerald-400">
                                {product.displayName}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    {/* Price Row */}
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-semibold text-[#A06C3B] dark:text-[#E5A96A]">
                            ${product.displayPrice.toFixed(2)}
                        </span>
                        {product.originalPrice > product.displayPrice && (
                            <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={handleQuickView}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 bg-white dark:bg-slate-800 text-stone-700  dark:text-stone-200 shadow-md transition-all hover:scale-110 hover:text-stone-900 dark:hover:text-white dark:border dark:border-slate-700/60 cursor-pointer"
                        aria-label="Quick View & Add to Cart"
                    >
                        <ShoppingCartIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

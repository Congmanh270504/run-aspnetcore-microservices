"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Heart,
    Maximize2,
    ShoppingBag,
    Star,
    Check,
    Loader2,
    ShoppingCartIcon,
} from "lucide-react";
import { DisplayProduct } from "../types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
    product: DisplayProduct;
    onQuickView: (product: DisplayProduct) => void;
}

export function ProductCard({ product, onQuickView }: Props) {
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdding) return;

        setIsAdding(true);
        try {
            await addToCart(product, 1, "Default");
            setJustAdded(true);
            toast.success(`Added "${product.displayName}" to cart!`);
            setTimeout(() => setJustAdded(false), 1600);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextState = !isWishlisted;
        setIsWishlisted(nextState);
        if (nextState) {
            toast.success(`Added "${product.displayName}" to wishlist!`);
        } else {
            toast.info(`Removed "${product.displayName}" from wishlist`);
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView(product);
    };

    return (
        <div className="group flex flex-col justify-between rounded-3xl bg-white p-2 transition-all duration-300 hover:shadow-lg">
            {/* Image Container with Warm Aesthetic Background */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F6F5F1] transition-colors">
                <Link
                    href={`/products/${product.id}`}
                    className="relative block h-full w-full overflow-hidden"
                >
                    {/* Primary Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.displayImage}
                        alt={product.displayName}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                            product.hoverImage ? "group-hover:opacity-0" : ""
                        }`}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "/images/placeholder.png";
                        }}
                    />

                    {/* Hover Image (Position: 6) */}
                    {product.hoverImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={product.hoverImage}
                            alt={`${product.displayName} alternate view`}
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
                        <span className="inline-flex items-center rounded-full bg-[#203D30] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                            {product.discountPercent}% off
                        </span>
                    </div>
                )}

                {/* Top-Right Vertical Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1.5 opacity-90 transition-all duration-300 group-hover:opacity-100">
                    {/* Wishlist Button */}
                    {/* <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 ${
                            isWishlisted
                                ? "text-rose-500 fill-rose-500"
                                : "text-stone-700 hover:text-stone-900"
                        }`}
                        title="Wishlist"
                        aria-label="Wishlist"
                    >
                        <Heart
                            className={`h-4 w-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                    </button> */}

                    {/* Quick View Button */}
                    <button
                        type="button"
                        onClick={handleQuickView}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition-all hover:scale-110 hover:text-stone-900"
                        title="Quick View"
                        aria-label="Quick View"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </button>

                    {/* Add to Cart Quick Button */}
                </div>
            </div>

            {/* Product Meta & Details */}
            <div className="flex flex-1 flex-col justify-between pt-3 pb-1 px-1">
                <div>
                    {/* Category & Rating Row */}
                    <div className="flex items-center justify-between text-xs text-stone-500">
                        {/* <span className="font-normal capitalize truncate max-w-[65%]">
                            {product.primaryCategory}
                        </span> */}
                        {/* Product Name */}
                        <Link
                            href={`/products/${product.id}`}
                            className="mt-1 block"
                        >
                            <h3 className="line-clamp-1 text-sm font-semibold text-stone-900 transition-colors group-hover:text-[#203D30]">
                                {product.displayName}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-1 font-semibold text-stone-800">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    {/* Price Row */}
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-semibold text-[#A06C3B]">
                            ${product.displayPrice.toFixed(2)}
                        </span>
                        {product.originalPrice > product.displayPrice && (
                            <span className="text-xs text-stone-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 ${
                            justAdded
                                ? "bg-emerald-600 text-white"
                                : "text-stone-700 hover:text-stone-900"
                        }`}
                        title="Add to Cart"
                        aria-label="Add to Cart"
                    >
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
                        ) : justAdded ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <ShoppingCartIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

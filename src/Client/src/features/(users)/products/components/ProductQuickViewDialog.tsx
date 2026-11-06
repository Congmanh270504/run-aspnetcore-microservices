"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ShoppingBag, Plus, Minus, ExternalLink, Check, Loader2 } from "lucide-react";
import { DisplayProduct } from "../types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: DisplayProduct | null;
}

export function ProductQuickViewDialog({
    open,
    onOpenChange,
    product,
}: Props) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!product) return null;

    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart(product, quantity, "Default");
            setIsSuccess(true);
            toast.success(`Added ${quantity}x "${product.displayName}" to cart!`);
            setTimeout(() => {
                setIsSuccess(false);
                onOpenChange(false);
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-3xl bg-white">
                <DialogHeader className="sr-only">
                    <DialogTitle>{product.displayName}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative aspect-square md:aspect-auto w-full bg-[#F6F5F1] p-6 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={product.displayImage}
                            alt={product.displayName}
                            className="max-h-[320px] w-auto object-contain rounded-xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/images/placeholder.png";
                            }}
                        />
                        {product.discountPercent > 0 && (
                            <span className="absolute top-4 left-4 rounded-full bg-[#203D30] px-3 py-1 text-xs font-semibold text-white">
                                {product.discountPercent}% off
                            </span>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-between p-6">
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    {product.primaryCategory}
                                </span>
                                <h2 className="mt-1 text-lg font-bold text-stone-900 leading-tight">
                                    {product.displayName}
                                </h2>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < Math.floor(product.rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-stone-200 text-stone-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-stone-800">
                                    {product.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-stone-400">
                                    ({product.reviewsCount} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-[#A06C3B]">
                                    ${product.displayPrice.toFixed(2)}
                                </span>
                                {product.originalPrice > product.displayPrice && (
                                    <span className="text-sm text-stone-400 line-through">
                                        ${product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                                {product.description ||
                                    "A rich formulation carefully created with top ingredients to provide lasting radiance and smooth finish."}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-xs font-semibold text-stone-700">
                                    Quantity:
                                </span>
                                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                                    <button
                                        type="button"
                                        onClick={handleDecrement}
                                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-semibold text-stone-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleIncrement}
                                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* View Full Product Link */}
                        <div className="pt-4 text-xs">
                            <Link
                                href={`/products/${product.id}`}
                                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#203D30] font-medium"
                                onClick={() => onOpenChange(false)}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Full Product Details
                            </Link>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border-stone-200 text-xs"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="rounded-xl bg-[#203D30] text-white hover:bg-[#193227] text-xs font-semibold gap-1.5 shadow-sm"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Adding...
                            </>
                        ) : isSuccess ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Added to Cart!
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Add to Cart (${(product.displayPrice * quantity).toFixed(2)})
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

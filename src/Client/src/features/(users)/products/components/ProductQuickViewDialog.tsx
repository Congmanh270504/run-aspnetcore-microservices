"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { FramedDialog } from "@/components/framed-dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
    Star,
    ShoppingBag,
    Plus,
    Minus,
    ExternalLink,
    Check,
    Loader2,
} from "lucide-react";
import { DisplayProduct } from "../types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: DisplayProduct | null;
}

export function ProductQuickViewDialog({ open, onOpenChange, product }: Props) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Normalize images list
    const imagesList = useMemo(() => {
        if (!product) return [];
        const list: {
            id?: string | number;
            src: string;
            position?: number;
            variantIds?: any[];
        }[] = [];
        if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {
            product.images.forEach((img: any, idx: number) => {
                const rawSrc = typeof img === "string" ? img : img?.src;
                if (rawSrc) {
                    const src =
                        rawSrc.startsWith("http") || rawSrc.startsWith("/")
                            ? rawSrc
                            : `/images/product/${rawSrc}`;
                    list.push({
                        id: img.id ?? `img-${idx}`,
                        src,
                        position:
                            typeof img === "object" && img.position != null
                                ? Number(img.position)
                                : idx + 1,
                        variantIds:
                            typeof img === "object"
                                ? img.variant_ids ||
                                  (img.variantId ? [img.variantId] : [])
                                : [],
                    });
                }
            });
        }

        if (list.length === 0 && product.displayImage) {
            list.push({ src: product.displayImage, position: 1 });
        } else if (list.length === 0 && product.imageFile) {
            const src =
                product.imageFile.startsWith("http") ||
                product.imageFile.startsWith("/")
                    ? product.imageFile
                    : `/images/product/${product.imageFile}`;
            list.push({ src, position: 1 });
        }

        if (list.length === 0) {
            list.push({ src: "/images/placeholder.png", position: 1 });
        }

        return list;
    }, [product]);

    // Normalize variants list
    const variantsList = useMemo(() => {
        if (!product) return [];
        if (
            product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0
        ) {
            return product.variants.map((v: any, index: number) => ({
                id: v.id ?? `v-${index}`,
                title: v.title || v.option1 || `Option ${index + 1}`,
                option1: v.option1 || v.title,
                price: Number(
                    v.price ?? product.displayPrice ?? product.price ?? 0,
                ),
                position: v.position ? Number(v.position) : index + 1,
                sku: v.sku || "",
                available: v.available !== false,
                image_id: v.image_id,
                featured_image: v.featured_image,
            }));
        }
        return [
            {
                id: "default",
                title: "Default Title",
                option1: "Default Title",
                price: Number(product.displayPrice ?? product.price ?? 0),
                position: 1,
                sku: "",
                available: true,
                image_id: null,
                featured_image: null,
            },
        ];
    }, [product]);

    // Check if product actually has multiple meaningful variants (not just 1 Default Title)
    const hasMultipleVariants = useMemo(() => {
        if (!variantsList || variantsList.length <= 1) return false;
        const validVariants = variantsList.filter(
            (v) => v.title && v.title.toLowerCase() !== "default title",
        );
        return validVariants.length > 1;
    }, [variantsList]);

    // Option name (Size, Option, etc.)
    const optionName = useMemo(() => {
        if (product?.options && Array.isArray(product.options)) {
            const found = product.options.find(
                (o: any) => o.name && o.name.toLowerCase() !== "title",
            );
            if (found) return found.name;
        }
        return "Size";
    }, [product]);

    // Reset selection and carousel when dialog opens or product changes
    useEffect(() => {
        if (open) {
            setSelectedVariantIndex(0);
            setQuantity(1);
            setCurrentSlide(0);
            if (carouselApi) {
                carouselApi.scrollTo(0, true);
            }
        }
    }, [product, open, carouselApi]);

    useEffect(() => {
        if (open) {
            document.documentElement.classList.add("none-scrollbar");
            document.body.classList.add("none-scrollbar");
        } else {
            document.documentElement.classList.remove("none-scrollbar");
            document.body.classList.remove("none-scrollbar");
        }

        return () => {
            document.documentElement.classList.remove("none-scrollbar");
            document.body.classList.remove("none-scrollbar");
        };
    }, [open]);

    // Listen to carousel slide change
    useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
        };
        carouselApi.on("select", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi]);

    if (!product) return null;

    const selectedVariant =
        variantsList[selectedVariantIndex] || variantsList[0];
    const currentPrice =
        selectedVariant?.price > 0
            ? selectedVariant.price
            : product.displayPrice;

    // Handle selecting variant and auto jumping carousel to corresponding image
    const handleSelectVariant = (index: number) => {
        setSelectedVariantIndex(index);
        const variant = variantsList[index];
        if (!variant || !carouselApi) return;

        // 1. Check if image maps to image_id or variant_ids
        let targetIndex = imagesList.findIndex((img) => {
            if (variant.image_id && img.id === variant.image_id) return true;
            if (img.variantIds && img.variantIds.includes(variant.id))
                return true;
            return false;
        });

        // 2. Check by position (variant.position === image.position)
        if (targetIndex === -1 && variant.position != null) {
            targetIndex = imagesList.findIndex(
                (img) =>
                    img.position != null &&
                    Number(img.position) === Number(variant.position),
            );
        }

        // 3. Fallback: variant.position 1-based index
        if (
            targetIndex === -1 &&
            variant.position != null &&
            variant.position > 0 &&
            variant.position <= imagesList.length
        ) {
            targetIndex = variant.position - 1;
        }

        // 4. Fallback to index if within bounds
        if (targetIndex === -1 && index < imagesList.length) {
            targetIndex = index;
        }

        if (targetIndex !== -1) {
            carouselApi.scrollTo(targetIndex);
        }
    };

    // Get the image URL that corresponds to a variant
    const getVariantImage = (variant: any, index: number) => {
        const defaultFallback =
            product.displayImage ||
            (product.images?.[0]?.src ?? product.imageFile ?? "/images/placeholder.png");

        if (!variant) return defaultFallback;
        let targetIndex = imagesList.findIndex((img) => {
            if (variant.image_id && img.id === variant.image_id) return true;
            if (img.variantIds && img.variantIds.includes(variant.id)) return true;
            return false;
        });

        if (targetIndex === -1 && variant.position != null) {
            targetIndex = imagesList.findIndex(
                (img) => img.position != null && Number(img.position) === Number(variant.position)
            );
        }

        if (targetIndex === -1 && variant.position != null && variant.position > 0 && variant.position <= imagesList.length) {
            targetIndex = variant.position - 1;
        }

        if (targetIndex === -1 && index < imagesList.length) {
            targetIndex = index;
        }

        return targetIndex !== -1 && imagesList[targetIndex]?.src
            ? imagesList[targetIndex].src
            : defaultFallback;
    };

    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            const variantTitle = hasMultipleVariants
                ? selectedVariant?.title ||
                  selectedVariant?.option1 ||
                  "Default"
                : "Default";
            const variantImage = getVariantImage(selectedVariant, selectedVariantIndex);
            const productToAdd = {
                ...product,
                name:
                    product.name ||
                    product.displayName ||
                    product.title ||
                    "Product",
                price: currentPrice,
                imageFile: variantImage,
            };
            await addToCart(productToAdd, quantity, variantTitle);
            setIsSuccess(true);
            const successMsg = hasMultipleVariants
                ? `Added ${quantity}x "${product.displayName}" (${variantTitle}) to cart!`
                : `Added ${quantity}x "${product.displayName}" to cart!`;
            toast.success(successMsg);
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
        <FramedDialog
            open={open}
            onOpenChange={onOpenChange}
            title={product.displayName}
            className="w-[95vw] sm:max-w-3xl lg:max-w-4xl rounded-2xl"
            innerClassName="p-3 sm:p-5 rounded-xl"
            footer={null}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Image Carousel */}
                <div className="relative aspect-square md:aspect-auto w-full bg-[#F6F5F1] dark:bg-slate-800/60 p-4 sm:p-6 flex items-center justify-center overflow-hidden group rounded-xl">
                    <Carousel
                        setApi={setCarouselApi}
                        opts={{
                            loop: imagesList.length > 1,
                        }}
                        className="w-full h-full flex flex-col justify-center"
                    >
                        <CarouselContent className="items-center">
                            {imagesList.map((img, idx) => (
                                <CarouselItem
                                    key={img.id ?? idx}
                                    className="flex items-center justify-center"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.src}
                                        alt={`${product.displayName} - ${idx + 1}`}
                                        className="max-h-[320px] w-auto object-contain rounded-xl select-none"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "/images/placeholder.png";
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {imagesList.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-slate-700 h-8 w-8 shadow-xs" />
                                <CarouselNext className="right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-slate-700 h-8 w-8 shadow-xs" />
                            </>
                        )}
                    </Carousel>

                    {/* Dots indicators */}
                    {imagesList.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                            {imagesList.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${
                                        currentSlide === idx
                                            ? "w-4 bg-[#203D30] dark:bg-emerald-500"
                                            : "w-1.5 bg-stone-300 dark:bg-stone-600"
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {product.discountPercent > 0 && (
                        <span className="absolute top-4 left-4 z-10 rounded-full bg-[#203D30] dark:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                            {product.discountPercent}% off
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between p-6">
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                {product.primaryCategory}
                            </span>
                            <h2 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
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
                                                : "fill-stone-200 dark:fill-stone-700 text-stone-200 dark:text-stone-700"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                                {product.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-stone-400 dark:text-stone-500">
                                ({product.reviewsCount} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold text-[#A06C3B] dark:text-[#E5A96A]">
                                ${currentPrice.toFixed(2)}
                            </span>
                            {product.originalPrice > currentPrice && (
                                <span className="text-sm text-stone-400 dark:text-stone-500 line-through">
                                    ${product.originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div
                            className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-h-50 overflow-y-auto space-y-1.5 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                            dangerouslySetInnerHTML={{
                                __html:
                                    product.description ||
                                    "A rich formulation carefully created with top ingredients to provide lasting radiance and smooth finish.",
                            }}
                        />

                        {/* Variant Selector (Options / Sizes) */}
                        {hasMultipleVariants && (
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-stone-700 dark:text-stone-200">
                                        {optionName}:
                                        <span className="ml-1.5 font-normal text-stone-500 dark:text-stone-400">
                                            {selectedVariant?.title ||
                                                selectedVariant?.option1}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {variantsList.map((variant, idx) => {
                                        const isSelected =
                                            selectedVariantIndex === idx;
                                        return (
                                            <button
                                                key={variant.id ?? idx}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectVariant(idx)
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                                    isSelected
                                                        ? "border-[#203D30] bg-[#203D30] dark:border-emerald-600 dark:bg-emerald-600 text-white shadow-xs"
                                                        : "border-stone-200 dark:border-stone-700 bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-slate-700"
                                                }`}
                                            >
                                                {variant.title ||
                                                    variant.option1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                                Quantity:
                            </span>
                            <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-stone-50 dark:bg-slate-800">
                                <button
                                    type="button"
                                    onClick={handleDecrement}
                                    className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-semibold text-stone-900 dark:text-stone-100">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleIncrement}
                                    className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
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
                            className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-[#203D30] dark:hover:text-emerald-400 font-medium"
                            onClick={() => onOpenChange(false)}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Full Product Details
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl border-stone-200 dark:border-stone-700 dark:text-stone-200 text-xs"
                >
                    Close
                </Button>
                <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="rounded-xl bg-[#203D30] dark:bg-emerald-700 text-white hover:bg-[#193227] dark:hover:bg-emerald-600 text-xs font-semibold gap-1.5 shadow-sm"
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
                            Add to Cart ($
                            {(currentPrice * quantity).toFixed(2)})
                        </>
                    )}
                </Button>
            </div>
        </FramedDialog>
    );
}

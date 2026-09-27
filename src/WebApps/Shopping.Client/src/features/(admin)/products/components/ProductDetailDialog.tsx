"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Package,
    Pencil,
    Tag,
    Layers,
    DollarSign,
    CheckCircle2,
    XCircle,
    Building2,
    Calendar,
    Hash,
    Info,
} from "lucide-react";
import type { Product } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onEdit?: (product: Product) => void;
}

interface ImageItem {
    id?: string | number;
    src: string;
    variantIds?: (string | number)[];
}

function formatImageSrc(src?: string): string {
    if (!src) return "/images/placeholder.png";
    if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:")
    ) {
        return src;
    }
    if (src.startsWith("/")) {
        return src;
    }
    return `/images/product/${src}`;
}

export function ProductDetailDialog({
    open,
    onOpenChange,
    product,
    onEdit,
}: Props) {
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");

    // Prepare normalized images list
    const imagesList = useMemo<ImageItem[]>(() => {
        if (!product) return [];
        const result: ImageItem[] = [];

        if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {
            product.images.forEach((img: any) => {
                if (typeof img === "string") {
                    result.push({ src: formatImageSrc(img) });
                } else if (img && typeof img === "object") {
                    const src = img.src || img.url || "";
                    if (src) {
                        result.push({
                            id: img.id,
                            src: formatImageSrc(src),
                            variantIds:
                                img.variant_ids ||
                                (img.variantId ? [img.variantId] : []),
                        });
                    }
                }
            });
        }

        if (result.length === 0 && product.imageFile) {
            result.push({ src: formatImageSrc(product.imageFile) });
        }

        if (result.length === 0) {
            result.push({ src: "/images/placeholder.png" });
        }

        return result;
    }, [product]);

    // Prepare normalized variants list
    const variantsList = useMemo(() => {
        if (!product) return [];
        if (
            product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0
        ) {
            return product.variants.map((v: any, index: number) => ({
                id: v.id ?? `v-${index}`,
                title: v.title || v.option1 || `Biến thể ${index + 1}`,
                price: Number(v.price ?? product.price ?? 0),
                grams: v.grams ? Number(v.grams) : null,
                sku: v.sku || "",
                available: v.available !== false,
                featured_image: v.featured_image,
                image_id: v.image_id,
            }));
        }
        return [
            {
                id: "default",
                title: "Default Variant",
                price: Number(product.price ?? 0),
                grams: null as number | null,
                sku: "",
                available: true,
                featured_image: null,
                image_id: null,
            },
        ];
    }, [product]);

    // Reset state when product changes or dialog opens
    useEffect(() => {
        if (open && product) {
            setSelectedVariantIndex(0);
            if (imagesList.length > 0) {
                setSelectedImageSrc(imagesList[0].src);
            } else {
                setSelectedImageSrc(formatImageSrc(product.imageFile));
            }
        }
    }, [open, product, imagesList]);

    if (!product) return null;

    const currentVariant =
        variantsList[selectedVariantIndex] || variantsList[0];
    const productTypeName = typeof product.product_type === "string"
        ? product.product_type
        : product.product_type?.name ?? "";
    const categories =
        product.category && product.category.length > 0
            ? product.category
            : productTypeName
              ? [productTypeName]
              : product.tags || [];

    // Switch active variant and auto update image if a matching variant image exists
    const handleSelectVariant = (index: number) => {
        setSelectedVariantIndex(index);
        const variant = variantsList[index];
        if (!variant) return;

        // 1. Check variant's featured image
        if (variant.featured_image) {
            const featSrc =
                typeof variant.featured_image === "string"
                    ? variant.featured_image
                    : variant.featured_image?.src;
            if (featSrc) {
                setSelectedImageSrc(formatImageSrc(featSrc));
                return;
            }
        }

        // 2. Check if image in imagesList maps to variant.id or variant.image_id
        const matchedImage = imagesList.find((img) => {
            if (variant.image_id && img.id === variant.image_id) return true;
            if (img.variantIds && img.variantIds.includes(variant.id))
                return true;
            return false;
        });

        if (matchedImage) {
            setSelectedImageSrc(matchedImage.src);
        }
    };

    // Switch image manually from thumbnail
    const handleSelectImage = (imgItem: ImageItem) => {
        setSelectedImageSrc(imgItem.src);
        // If image has variantIds, match first variant
        if (imgItem.variantIds && imgItem.variantIds.length > 0) {
            const matchedVarIndex = variantsList.findIndex((v) =>
                imgItem.variantIds?.includes(v.id),
            );
            if (matchedVarIndex !== -1) {
                setSelectedVariantIndex(matchedVarIndex);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden shadow-2xl border-none gap-2"
                closeButtonClassName="text-white hover:bg-white/20 hover:text-white top-5 right-5"
            >
                {/* Header */}
                <DialogHeader className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">
                                {product.name || product.title}
                            </DialogTitle>
                            <DialogDescription className="text-white/80 text-sm mt-0.5">
                                {product.created_at && (
                                    <div className="flex items-center gap-2 truncate">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-white">
                                            Created at:{" "}
                                        </span>
                                        <span className="text-white">
                                            {new Date(
                                                product.created_at,
                                            ).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left: Image Gallery & Variant Image View (5 cols) */}
                        <div className="md:col-span-5 space-y-4">
                            {/* Main Active Image View */}
                            <div className="relative aspect-square w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center shadow-sm overflow-hidden group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={
                                        selectedImageSrc ||
                                        "/images/placeholder.png"
                                    }
                                    alt={product.name || product.title}
                                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "/images/placeholder.png";
                                    }}
                                />

                                {/* Variant tag overlay on image if present */}
                                {currentVariant &&
                                    currentVariant.title !==
                                        "Default Title" && (
                                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs border border-white/10 flex items-center gap-1">
                                            <Layers className="w-3 h-3 text-blue-400" />
                                            {currentVariant.title}
                                        </span>
                                    )}
                            </div>

                            {/* Image Thumbnails List */}
                            {imagesList.length > 1 && (
                                <div className="space-y-1.5">
                                    <Carousel
                                        opts={{
                                            align: "start",
                                        }}
                                        className="w-full px-7"
                                    >
                                        <CarouselContent className="-ml-2">
                                            {imagesList.map((img, idx) => {
                                                const isActive =
                                                    selectedImageSrc ===
                                                    img.src;
                                                return (
                                                    <CarouselItem
                                                        key={idx}
                                                        className="pl-2 basis-1/4"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectImage(
                                                                    img,
                                                                )
                                                            }
                                                            className={`relative h-16 w-full shrink-0 rounded-lg bg-white dark:bg-slate-900 border p-1 transition-all overflow-hidden cursor-pointer ${
                                                                isActive
                                                                    ? "border-blue-600 ring-2 ring-blue-600/30 scale-95"
                                                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 opacity-70 hover:opacity-100"
                                                            }`}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={img.src}
                                                                alt=""
                                                                className="h-full w-full object-contain"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    (
                                                                        e.target as HTMLImageElement
                                                                    ).src =
                                                                        "/images/placeholder.png";
                                                                }}
                                                            />
                                                        </button>
                                                    </CarouselItem>
                                                );
                                            })}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-0 h-6 w-6" />
                                        <CarouselNext className="right-0 h-6 w-6" />
                                    </Carousel>
                                </div>
                            )}
                        </div>

                        {/* Right: Product Details & Variant Selection (7 cols) */}
                        <div className="md:col-span-7 space-y-4">
                            {/* Variants Selection Section */}
                            {variantsList.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-blue-600" />
                                            Variants ({variantsList.length})
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {product.vendor && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] flex items-center gap-1 bg-green-600 text-white"
                                                    >
                                                        <Building2 className="w-3 h-3" />
                                                        {product.vendor}
                                                    </Badge>
                                                )}
                                            </div>

                                            {productTypeName &&
                                                !categories.includes(
                                                    productTypeName,
                                                ) && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Type:{" "}
                                                        {productTypeName}
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {variantsList.map((variant, idx) => {
                                            const isSelected =
                                                selectedVariantIndex === idx;
                                            return (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectVariant(idx)
                                                    }
                                                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600 text-blue-950 dark:text-blue-100"
                                                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                                    }`}
                                                >
                                                    <p className="text-xs font-semibold truncate">
                                                        {variant.title}
                                                    </p>
                                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                        $
                                                        {variant.price.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                    {variant.sku && (
                                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-mono">
                                                            {variant.sku}
                                                        </p>
                                                    )}
                                                    {variant.grams ? (
                                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                            Weight: {variant.grams}g
                                                        </p>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Categories & Tags */}
                            <div className="space-y-2 border-t pt-3">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-4 h-4 text-blue-600" />
                                    Categories & Tags
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((cat, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs font-medium"
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 border-t pt-3">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    Description
                                </label>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 max-h-47 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                                    {product.description ||
                                    product.body_html ? (
                                        <div
                                            className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-line"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    product.description ||
                                                    product.body_html ||
                                                    "",
                                            }}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground italic">
                                            This product has no description.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-3 border-t bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between sm:justify-between">
                    <div className="flex items-center ml-auto gap-2">
                        {onEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                className="border-amber-400/60 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50 gap-1.5 cursor-pointer text-xs"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEdit(product);
                                }}
                            >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="text-xs"
                        >
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

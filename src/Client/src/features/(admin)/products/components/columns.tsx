"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon, Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";

import { ProductTypeBadge } from "./ProductTypeBadge";

export function createProductColumns(
    onView: (product: Product) => void,
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void,
    discounts: Coupon[] = [],
): ColumnDef<Product>[] {
    const discountsMap = new Map<string, Coupon>();
    (discounts || []).forEach((d) => {
        if (d.productName) {
            discountsMap.set(d.productName.toLowerCase(), d);
        }
    });

    return [
        {
            id: "image",
            header: () => <div className="w-[60px] text-center">Image</div>,
            cell: ({ row }) => {
                const product = row.original;
                const imageSrc = product.imageFile?.startsWith("http")
                    ? product.imageFile
                    : product.imageFile
                      ? `/images/product/${product.imageFile}`
                      : "/images/placeholder.png";

                return (
                    <div className="h-12 w-12 rounded-lg bg-slate-100 p-1 flex items-center justify-center border shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageSrc}
                            alt={product.name || product.title || "Product"}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/images/placeholder.png";
                            }}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: () => <div className="text-center">Product Name</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="space-y-0.5 text-center">
                        <p className="font-bold text-sm text-slate-900 line-clamp-1">
                            {product.name || product.title}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: "product_type",
            header: () => <div className="text-center">Type</div>,
            cell: ({ row }) => {
                const product = row.original;
                const productTypeData =
                    product.product_type ?? product.productType;
                return (
                    <div className="flex justify-center">
                        <ProductTypeBadge value={productTypeData} />
                    </div>
                );
            },
        },

        {
            accessorKey: "category",
            header: () => <div className="text-center">Categories</div>,
            cell: ({ row }) => {
                const product = row.original;
                const ptName =
                    typeof product.product_type === "string"
                        ? product.product_type
                        : product.product_type?.name;
                const categories =
                    product.category && product.category.length > 0
                        ? product.category
                        : ptName
                          ? [ptName]
                          : product.tags || [];

                return (
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                        {categories.slice(0, 3).map((cat) => (
                            <Badge
                                key={cat}
                                variant="secondary"
                                className="text-[10px] font-medium"
                            >
                                {cat}
                            </Badge>
                        ))}
                        {categories.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                                +{categories.length - 3}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "price",
            header: () => <div className="text-center">Price</div>,
            cell: ({ row }) => {
                const product = row.original;
                const priceVal = Number(
                    product.price ?? product.variants?.[0]?.price ?? 0,
                );
                return (
                    <div className="text-center font-bold text-sm text-emerald-600">
                        ${priceVal.toFixed(2)}
                    </div>
                );
            },
        },
        {
            id: "discount",
            accessorFn: (product) => {
                const productName = (
                    product.name ||
                    product.title ||
                    ""
                ).toLowerCase();
                const coupon = discountsMap.get(productName);
                if (coupon) return coupon.amount;
                if (typeof product.discount === "number")
                    return product.discount;
                if (product.discount && typeof product.discount === "object") {
                    return product.discount.amount || 0;
                }
                return 0;
            },
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="p-0 hover:bg-transparent font-bold text-xs"
                    >
                        Discount <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const product = row.original;
                const productName = (
                    product.name ||
                    product.title ||
                    ""
                ).toLowerCase();
                const coupon = discountsMap.get(productName);

                let discountAmount = 0;
                let discountDesc = "";

                if (coupon) {
                    discountAmount = coupon.amount;
                    discountDesc = coupon.description || "";
                } else if (typeof product.discount === "number") {
                    discountAmount = product.discount;
                } else if (
                    product.discount &&
                    typeof product.discount === "object"
                ) {
                    discountAmount = product.discount.amount || 0;
                    discountDesc = product.discount.description || "";
                }

                if (!discountAmount || discountAmount <= 0) {
                    return (
                        <div className="text-center text-slate-400 text-xs font-medium">
                            —
                        </div>
                    );
                }

                const badge = (
                    <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs"
                    >
                        -${discountAmount.toFixed(2)}
                    </Badge>
                );

                if (discountDesc) {
                    return (
                        <div className="flex justify-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>{badge}</div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold text-xs">
                                        {discountDesc}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    );
                }

                return <div className="flex justify-center">{badge}</div>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onView(product)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                                >
                                    <Eye className="h-4 w-4 text-blue-600" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onEdit(product)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                                >
                                    <Pencil className="h-4 w-4 text-yellow-600" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Chỉnh sửa</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onDelete(product)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];
}

"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";

export function createProductColumns(
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void,
): ColumnDef<Product>[] {
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
            accessorKey: "category",
            header: () => <div className="text-center">Categories</div>,
            cell: ({ row }) => {
                const product = row.original;
                const categories =
                    product.category && product.category.length > 0
                        ? product.category
                        : product.product_type
                          ? [product.product_type]
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
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-center gap-1">
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

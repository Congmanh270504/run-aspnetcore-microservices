"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { ShoppingCartItem } from "@/types";
import Image from "next/image";

interface CartColumnsOptions {
    updateQuantity: (
        productId: string,
        quantity: number,
        color?: string,
    ) => Promise<void>;
    removeFromCart: (productId: string, color?: string) => Promise<void>;
    isLoading: boolean;
}

export function createCartColumns({
    updateQuantity,
    removeFromCart,
    isLoading,
}: CartColumnsOptions): ColumnDef<ShoppingCartItem>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center px-1">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 cursor-pointer"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center px-1">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600 cursor-pointer"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "product",
            header: () => <div className="text-left">Product</div>,
            cell: ({ row }) => {
                const item = row.original;
                const imageSrc = item.imageFile
                    ? item.imageFile.startsWith("http") ||
                      item.imageFile.startsWith("/")
                        ? item.imageFile
                        : `/images/product/${item.imageFile}`
                    : "/images/placeholder.png";

                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="relative h-16 w-16 rounded-md bg-muted/20 p-1 flex items-center justify-center border shrink-0">
                            <Image
                                src={imageSrc}
                                alt={item.productName}
                                fill
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "/images/placeholder.png";
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <Link
                                href={`/products/${item.productId}`}
                                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                            >
                                {item.productName}
                            </Link>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "variant",
            header: () => <div className="text-center">Variation</div>,
            cell: ({ row }) => {
                const item = row.original;
                const variantText = item.variant || item.color;
                if (!variantText || variantText === "Default") {
                    return (
                        <div className="text-center text-xs text-muted-foreground">
                            —
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 border border-border/60 text-foreground">
                            {variantText}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "price",
            header: () => <div className="text-right">Unit Price</div>,
            cell: ({ row }) => {
                const price = Number(row.original.price || 0);
                return (
                    <div className="text-right text-sm font-medium">
                        ${price.toFixed(2)}
                    </div>
                );
            },
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-center">Quantity</div>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <div className="inline-flex items-center border rounded-md bg-muted/20">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                                onClick={() =>
                                    updateQuantity(
                                        item.productId,
                                        item.quantity - 1,
                                        item.variant || item.color,
                                    )
                                }
                                disabled={isLoading}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-xs font-bold">
                                {item.quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                                onClick={() =>
                                    updateQuantity(
                                        item.productId,
                                        item.quantity + 1,
                                        item.variant || item.color,
                                    )
                                }
                                disabled={isLoading}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "total",
            header: () => <div className="text-right">Total Price</div>,
            cell: ({ row }) => {
                const item = row.original;
                const total = Number(item.price || 0) * item.quantity;
                return (
                    <div className="text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ${total.toFixed(2)}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8 cursor-pointer"
                            onClick={() =>
                                removeFromCart(
                                    item.productId,
                                    item.variant || item.color,
                                )
                            }
                            disabled={isLoading}
                            title="Remove item"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}

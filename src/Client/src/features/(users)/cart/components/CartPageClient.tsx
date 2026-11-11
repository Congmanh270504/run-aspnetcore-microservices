"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import { createCartColumns } from "./columns";
import { ShoppingCartItem } from "@/types";
import { RowSelectionState } from "@tanstack/react-table";
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";

export function CartPageClient() {
    const router = useRouter();
    const {
        cart,
        updateQuantity,
        removeFromCart,
        isLoading,
        clearCart,
        totalItemsCount,
    } = useCart();

    const [isDocked, setIsDocked] = useState(true);
    const dockRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    const getItemKey = (item: ShoppingCartItem) =>
        `${item.productId}__${item.variant || item.color || "Default"}`;

    // Row selection state: all selected by default
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized && cart.items.length > 0) {
            const allSelected: RowSelectionState = {};
            cart.items.forEach((item) => {
                allSelected[getItemKey(item)] = true;
            });
            setRowSelection(allSelected);
            setIsInitialized(true);
        } else if (isInitialized) {
            const validKeys = new Set(cart.items.map(getItemKey));
            setRowSelection((prev) => {
                const next: RowSelectionState = {};
                Object.keys(prev).forEach((key) => {
                    if (validKeys.has(key) && prev[key]) {
                        next[key] = true;
                    }
                });
                return next;
            });
        }
    }, [cart.items, isInitialized]);

    // Selected items calculations
    const selectedCartItems = useMemo(() => {
        return cart.items.filter((item) => rowSelection[getItemKey(item)]);
    }, [cart.items, rowSelection]);

    const selectedSubtotal = useMemo(() => {
        return selectedCartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
    }, [selectedCartItems]);

    const selectedTotalCount = useMemo(() => {
        return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [selectedCartItems]);

    const handleProceedToCheckout = () => {
        if (selectedCartItems.length === 0) return;

        if (typeof window !== "undefined") {
            const dataToStore = selectedCartItems.map((item) => ({
                productId: item.productId,
                variant: item.variant || item.color || "Default",
            }));
            sessionStorage.setItem(
                "checkout_selected_items",
                JSON.stringify(dataToStore),
            );
        }

        const itemsParam = encodeURIComponent(
            selectedCartItems
                .map(
                    (item) =>
                        `${item.productId}::${item.variant || item.color || "Default"}`,
                )
                .join(","),
        );

        router.push(`/checkout?items=${itemsParam}`);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!dockRef.current) return;
            const dockRect = dockRef.current.getBoundingClientRect();
            const barHeight = barRef.current?.offsetHeight || 90;
            const threshold = window.innerHeight - barHeight;
            setIsDocked(dockRect.top <= threshold);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [cart.items.length]);

    const columns = useMemo(
        () =>
            createCartColumns({
                updateQuantity,
                removeFromCart,
                isLoading,
            }),
        [updateQuantity, removeFromCart, isLoading],
    );

    if (cart.items.length === 0) {
        return (
            <div className="text-center py-16 border rounded-2xl bg-card space-y-4 max-w-md mx-auto my-8 p-8 shadow-sm">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold">Your Cart is Empty</h2>
                <p className="text-sm text-muted-foreground">
                    Looks like you haven&apos;t added any items to your shopping
                    cart yet.
                </p>
                <Link href="/products" className="inline-block pt-2">
                    <Button className="gap-2">
                        Explore Products <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8 items-start">
            {/* Items DataTable */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden ">
                <DataTable
                    columns={columns}
                    data={cart.items}
                    getRowId={getItemKey}
                    enableRowSelection
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    enableSearch={false}
                    hideToolbar
                />
            </div>

            {/* Order Summary Bottom Bar (Sticky / Docked at page end before footer) */}
            <div ref={dockRef} className="relative min-h-[92px] w-full">
                <div
                    ref={barRef}
                    className={
                        isDocked
                            ? "w-full bg-card border border-border rounded-2xl shadow-sm transition-all duration-200 px-6"
                            : "fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] transition-all duration-200"
                    }
                >
                    <div
                        className={
                            isDocked ? "" : "container mx-auto px-4 sm:px-8"
                        }
                    >
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-3 sm:py-4">
                            {/* Left: Cart Controls */}
                            <div className="flex items-center gap-3">
                                <Link href="/products">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-xs rounded-xl h-9 cursor-pointer"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />{" "}
                                        Continue Shopping
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive text-xs h-9 cursor-pointer"
                                    onClick={clearCart}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />{" "}
                                    Clear Entire Cart
                                </Button>
                                <span className="hidden lg:inline text-xs text-muted-foreground border-l pl-3">
                                    Selected:{" "}
                                    <strong className="text-foreground">
                                        {selectedTotalCount}
                                    </strong>{" "}
                                    /{" "}
                                    {totalItemsCount ||
                                        cart.items.reduce(
                                            (s, i) => s + i.quantity,
                                            0,
                                        )}{" "}
                                    items
                                </span>
                            </div>

                            {/* Right: Pricing breakdown & Proceed to Checkout */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 sm:gap-6">
                                <div className="text-left sm:text-right">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:justify-end">
                                        <span>
                                            Subtotal:{" "}
                                            <strong className="text-foreground font-semibold">
                                                ${selectedSubtotal.toFixed(2)}
                                            </strong>
                                        </span>
                                        <span>•</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            Free Shipping
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 sm:justify-end mt-0.5">
                                        <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                                            Total:
                                        </span>
                                        <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                            ${selectedSubtotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    onClick={handleProceedToCheckout}
                                    disabled={selectedCartItems.length === 0}
                                    className="h-11 sm:h-12 px-6 sm:px-8 gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm sm:text-base cursor-pointer disabled:opacity-50"
                                >
                                    Proceed to Checkout ({selectedTotalCount})
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

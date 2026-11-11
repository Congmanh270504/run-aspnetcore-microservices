"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
    ArrowRightIcon,
    ShoppingBag,
    Trash2Icon,
    Plus,
    Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { getUserProductById } from "@/features/(users)/products/actions/productActions";
import { Product, ShoppingCartItem } from "@/types";

interface VariantOption {
    title: string;
    price?: number;
}

export default function DrawerCart() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const {
        cart,
        totalItemsCount,
        updateQuantity,
        updateVariant,
        removeFromCart,
        isLoading,
    } = useCart();

    const [productMap, setProductMap] = useState<Record<string, Product>>({});
    const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(
        new Set(),
    );
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const getItemKey = (item: ShoppingCartItem) =>
        `${item.productId}__${item.variant || item.color || "Default"}`;

    // Initialize all items as selected by default, prune removed items
    useEffect(() => {
        if (!isInitialized && cart.items.length > 0) {
            setSelectedItemKeys(new Set(cart.items.map(getItemKey)));
            setIsInitialized(true);
        } else if (isInitialized) {
            const validKeys = new Set(cart.items.map(getItemKey));
            setSelectedItemKeys((prev) => {
                const next = new Set<string>();
                prev.forEach((key) => {
                    if (validKeys.has(key)) next.add(key);
                });
                return next;
            });
        }
    }, [cart.items, isInitialized]);

    // Fetch product details for items in cart to discover available variants
    useEffect(() => {
        if (!isOpen || cart.items.length === 0) return;

        const missingIds = cart.items
            .map((item) => item.productId)
            .filter((id) => !productMap[id]);

        if (missingIds.length === 0) return;

        const uniqueIds = Array.from(new Set(missingIds));
        let isMounted = true;

        Promise.all(
            uniqueIds.map(async (id) => {
                try {
                    const prod = await getUserProductById(id);
                    return { id, prod };
                } catch {
                    return { id, prod: null };
                }
            }),
        ).then((results) => {
            if (!isMounted) return;
            setProductMap((prev) => {
                const next = { ...prev };
                results.forEach(({ id, prod }) => {
                    if (prod) next[id] = prod;
                });
                return next;
            });
        });

        return () => {
            isMounted = false;
        };
    }, [isOpen, cart.items, productMap]);

    const handleToggleItem = (key: string, checked: boolean) => {
        setSelectedItemKeys((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(key);
            } else {
                next.delete(key);
            }
            return next;
        });
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedItemKeys(new Set(cart.items.map(getItemKey)));
        } else {
            setSelectedItemKeys(new Set());
        }
    };

    const selectedCartItems = cart.items.filter((item) =>
        selectedItemKeys.has(getItemKey(item)),
    );

    const subtotal = selectedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;

    const getAvailableVariants = (item: ShoppingCartItem): VariantOption[] => {
        const prod = productMap[item.productId];
        const variants: VariantOption[] = [];
        const seen = new Set<string>();

        const currentVal = item.variant || item.color || "Default";
        variants.push({ title: currentVal, price: item.price });
        seen.add(currentVal);

        if (prod?.variants && Array.isArray(prod.variants)) {
            for (const v of prod.variants) {
                const title = v.title || v.option1 || v.name;
                if (title && !seen.has(title)) {
                    const parsedPrice =
                        typeof v.price === "string"
                            ? parseFloat(v.price)
                            : typeof v.price === "number"
                              ? v.price
                              : undefined;
                    variants.push({
                        title,
                        price:
                            parsedPrice !== undefined && !isNaN(parsedPrice)
                                ? parsedPrice
                                : undefined,
                    });
                    seen.add(title);
                }
            }
        }

        if (prod?.options && Array.isArray(prod.options)) {
            for (const opt of prod.options) {
                if (Array.isArray(opt.values)) {
                    for (const val of opt.values) {
                        if (val && typeof val === "string" && !seen.has(val)) {
                            variants.push({ title: val });
                            seen.add(val);
                        }
                    }
                }
            }
        }

        // Common color options fallback if the product has no variant options defined
        const standardColors = ["Black", "Blue", "Red", "Green", "White"];
        if (variants.length <= 1) {
            for (const c of standardColors) {
                if (!seen.has(c)) {
                    variants.push({ title: c, price: item.price });
                    seen.add(c);
                }
            }
        }

        return variants;
    };

    const handleProceedToCheckout = () => {
        if (selectedCartItems.length === 0) return;

        // Save selected items into sessionStorage for reliable checkout recovery
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

        // Also pass as URL query param for direct navigation
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
        if (isOpen) {
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
    }, [isOpen]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    className="relative rounded-lg cursor-pointer"
                    size="icon"
                >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="sr-only">Shopping Cart</span>
                    {totalItemsCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 min-w-5 px-1 text-[11px] font-bold text-white bg-[#203D30] hover:bg-[#193227] flex items-center justify-center rounded-full border-none shadow-sm"
                        >
                            {totalItemsCount}
                        </Badge>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="fixed inset-y-0 m-4 right-0 left-auto h-full bg-transparent w-full sm:w-[420px] border-none flex flex-col">
                <div className="bg-white mb-8 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl h-[98%] shadow-2xl flex flex-col overflow-hidden">
                    <DrawerHeader className="border-b border-stone-100 dark:border-stone-800 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DrawerTitle className="text-base font-bold text-stone-900 dark:text-stone-100">
                                Shopping Cart
                            </DrawerTitle>
                            {totalItemsCount > 0 && (
                                <span className="text-xs text-stone-500 font-medium">
                                    ({totalItemsCount}{" "}
                                    {totalItemsCount === 1 ? "item" : "items"})
                                </span>
                            )}
                        </div>
                    </DrawerHeader>

                    <div className="no-scrollbar space-y-4 overflow-y-auto px-5 py-4 flex-1">
                        {cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-400">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
                                    Your Cart is Empty
                                </h3>
                                <p className="text-xs text-stone-500 mt-1 max-w-[220px]">
                                    You haven&apos;t added any items to your
                                    shopping cart yet.
                                </p>
                                <DrawerClose asChild>
                                    <Link href="/products" className="mt-4">
                                        <Button
                                            size="sm"
                                            className="bg-[#203D30] text-white hover:bg-[#193227] rounded-full text-xs cursor-pointer shadow-sm"
                                        >
                                            Explore Products
                                        </Button>
                                    </Link>
                                </DrawerClose>
                            </div>
                        ) : (
                            <>
                                {/* Select All Controls */}
                                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all-cart"
                                            checked={
                                                cart.items.length > 0 &&
                                                selectedItemKeys.size ===
                                                    cart.items.length
                                            }
                                            onCheckedChange={(checked) =>
                                                handleToggleAll(!!checked)
                                            }
                                            className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] cursor-pointer"
                                        />
                                        <label
                                            htmlFor="select-all-cart"
                                            className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none"
                                        >
                                            Select All ({cart.items.length})
                                        </label>
                                    </div>
                                    <span className="text-[11px] text-stone-500 font-medium">
                                        {selectedCartItems.length} selected
                                    </span>
                                </div>

                                {cart.items.map((item, index) => {
                                    const itemKey = getItemKey(item);
                                    const isSelected =
                                        selectedItemKeys.has(itemKey);
                                    const availableVariants =
                                        getAvailableVariants(item);
                                    const currentVariant =
                                        item.variant || item.color || "Default";

                                    return (
                                        <div key={`${itemKey}-${index}`}>
                                            {index > 0 && (
                                                <Separator className="my-4" />
                                            )}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-[#F6F5F1] p-1 flex items-center justify-center">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={
                                                                item.imageFile
                                                                    ? item.imageFile.startsWith(
                                                                          "http",
                                                                      ) ||
                                                                      item.imageFile.startsWith(
                                                                          "/",
                                                                      )
                                                                        ? item.imageFile
                                                                        : `/images/product/${item.imageFile}`
                                                                    : "/images/placeholder.png"
                                                            }
                                                            alt={
                                                                item.productName
                                                            }
                                                            className="h-full w-full object-contain"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).src =
                                                                    "/images/placeholder.png";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                                                                {
                                                                    item.productName
                                                                }
                                                            </h4>

                                                            {/* Checkbox for selecting product for checkout */}
                                                            <Checkbox
                                                                id={`check-${itemKey}`}
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    handleToggleItem(
                                                                        itemKey,
                                                                        !!checked,
                                                                    )
                                                                }
                                                                className="data-[state=checked]:bg-[#203D30] data-[state=checked]:border-[#203D30] cursor-pointer"
                                                            />
                                                        </div>

                                                        {/* Select available variants */}
                                                        {availableVariants.length >
                                                            2 && (
                                                            <div className="flex items-center gap-2 pt-0.5">
                                                                <span className="text-xs text-stone-500 shrink-0">
                                                                    Option:
                                                                </span>
                                                                <Select
                                                                    value={
                                                                        currentVariant
                                                                    }
                                                                    onValueChange={(
                                                                        val,
                                                                    ) => {
                                                                        const vObj =
                                                                            availableVariants.find(
                                                                                (
                                                                                    v,
                                                                                ) =>
                                                                                    v.title ===
                                                                                    val,
                                                                            );
                                                                        updateVariant(
                                                                            item.productId,
                                                                            currentVariant,
                                                                            val,
                                                                            vObj?.price,
                                                                        );
                                                                        if (
                                                                            isSelected
                                                                        ) {
                                                                            setSelectedItemKeys(
                                                                                (
                                                                                    prev,
                                                                                ) => {
                                                                                    const next =
                                                                                        new Set(
                                                                                            prev,
                                                                                        );
                                                                                    next.delete(
                                                                                        itemKey,
                                                                                    );
                                                                                    next.add(
                                                                                        `${item.productId}__${val}`,
                                                                                    );
                                                                                    return next;
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                    disabled={
                                                                        isLoading
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-7 text-xs border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-lg px-2 py-0 focus:ring-0 focus:ring-offset-0">
                                                                        <SelectValue placeholder="Select variant" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="text-xs">
                                                                        {availableVariants.map(
                                                                            (
                                                                                v,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        v.title
                                                                                    }
                                                                                    value={
                                                                                        v.title
                                                                                    }
                                                                                    className="text-xs"
                                                                                >
                                                                                    {
                                                                                        v.title
                                                                                    }
                                                                                    {v.price !==
                                                                                        undefined &&
                                                                                    !isNaN(
                                                                                        v.price,
                                                                                    )
                                                                                        ? ` ($${Number(v.price).toFixed(2)})`
                                                                                        : ""}
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-1">
                                                            <span className="text-sm font-bold text-[#A06C3B]">
                                                                $
                                                                {item.price.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-800">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.productId,
                                                                            item.quantity -
                                                                                1,
                                                                            item.variant ||
                                                                                item.color,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading ||
                                                                        item.quantity ===
                                                                            1
                                                                    }
                                                                    className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <span className="w-6 text-center text-xs font-semibold text-stone-900 dark:text-stone-100">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.productId,
                                                                            item.quantity +
                                                                                1,
                                                                            item.variant ||
                                                                                item.color,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading
                                                                    }
                                                                    className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.productId,
                                                            item.variant ||
                                                                item.color,
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40 h-7 text-xs w-full gap-1.5 cursor-pointer rounded-lg"
                                                >
                                                    <Trash2Icon className="h-3.5 w-3.5" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="my-4 space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                                    <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                                        <p>Selected items</p>
                                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                                            {selectedCartItems.length} /{" "}
                                            {cart.items.length}
                                        </p>
                                    </div>
                                    <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                                        <p>Subtotal</p>
                                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                                            ${subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                                        <p>Shipping</p>
                                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                                            ${shipping.toFixed(2)}
                                        </p>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-sm">
                                        <p className="font-bold text-stone-900 dark:text-stone-100">
                                            Total
                                        </p>
                                        <p className="font-bold text-[#A06C3B]">
                                            ${total.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {cart.items.length > 0 && (
                        <DrawerFooter className="mt-auto bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 p-4 space-y-2">
                            <DrawerClose asChild>
                                <Button
                                    onClick={handleProceedToCheckout}
                                    disabled={selectedCartItems.length === 0}
                                    className="w-full bg-[#203D30] hover:bg-[#193227] text-white rounded-xl gap-2 text-xs font-semibold shadow-sm cursor-pointer h-10 disabled:opacity-50"
                                >
                                    Proceed to Checkout (${total.toFixed(2)}){" "}
                                    <ArrowRightIcon className="h-3.5 w-3.5" />
                                </Button>
                            </DrawerClose>
                            <DrawerClose asChild>
                                <Link href="/cart" className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl text-xs border-stone-200 dark:border-stone-700 cursor-pointer h-9"
                                    >
                                        View Full Cart Details
                                    </Button>
                                </Link>
                            </DrawerClose>
                        </DrawerFooter>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

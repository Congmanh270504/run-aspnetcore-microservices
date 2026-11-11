"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import {
    ShoppingCart,
    ShoppingCartItem,
    BasketCheckoutData,
    Product,
} from "@/types";
import { revalidatePath } from "next/cache";
import { toValidGuid } from "@/lib/utils";

const DEFAULT_USER = "swn";

interface GetBasketResponse {
    cart: ShoppingCart;
}

interface StoreBasketResponse {
    userName: string;
}

interface DeleteBasketResponse {
    isSuccess: boolean;
}

interface CheckoutBasketResponse {
    isSuccess: boolean;
}

export async function getBasket(
    userName: string = DEFAULT_USER,
): Promise<ShoppingCart> {
    const result = await fetchFromGateway<GetBasketResponse>(
        `/basket-service/basket/${userName}`,
    );

    if (!result || !result.cart) {
        return {
            userName,
            items: [],
            totalPrice: 0,
        };
    }

    const items = result.cart.items || [];
    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return {
        ...result.cart,
        items,
        totalPrice,
    };
}

export async function storeBasket(cart: ShoppingCart): Promise<boolean> {
    const result = await fetchFromGateway<StoreBasketResponse>(
        `/basket-service/basket`,
        {
            method: "POST",
            body: JSON.stringify({ cart }),
        },
    );

    revalidatePath("/cart");
    revalidatePath("/checkout");
    return !!result;
}

export async function addToBasket(
    product: Product,
    quantity: number = 1,
    color: string = "Black",
    userName: string = DEFAULT_USER,
): Promise<ShoppingCart> {
    const currentBasket = await getBasket(userName);
    const items = [...currentBasket.items];
    const resolvedProductId = toValidGuid(String(product.id));
    const existingIndex = items.findIndex(
        (i) =>
            (i.productId === product.id || i.productId === resolvedProductId) &&
            (i.color === color || i.variant === color),
    );

    const imageFile =
        product.imageFile ||
        (product as any).displayImage ||
        (Array.isArray(product.images) && product.images.length > 0
            ? typeof product.images[0] === "string"
                ? product.images[0]
                : product.images[0]?.src
            : "");

    if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
        if (imageFile) {
            items[existingIndex].imageFile = imageFile;
        }
        items[existingIndex].variant = color;
    } else {
        items.push({
            productId: resolvedProductId,
            productName:
                product.name ||
                (product as any).displayName ||
                (product as any).title ||
                "Product",
            price: product.price,
            quantity,
            color,
            variant: color,
            imageFile: imageFile || undefined,
        });
    }

    const updatedBasket: ShoppingCart = {
        userName,
        items,
    };

    await storeBasket(updatedBasket);
    return await getBasket(userName);
}

export async function updateItemQuantity(
    productId: string,
    quantity: number,
    color?: string,
    userName: string = DEFAULT_USER,
): Promise<ShoppingCart> {
    const currentBasket = await getBasket(userName);
    let items = [...currentBasket.items];
    const resolvedProductId = toValidGuid(productId);

    const matchItem = (item: ShoppingCartItem) => {
        const idMatch =
            item.productId === productId ||
            item.productId === resolvedProductId;
        if (!idMatch) return false;
        if (color !== undefined) {
            return item.color === color || item.variant === color;
        }
        return true;
    };

    if (quantity <= 0) {
        items = items.filter((i) => !matchItem(i));
    } else {
        items = items.map((item) =>
            matchItem(item) ? { ...item, quantity } : item,
        );
    }

    const updatedBasket: ShoppingCart = {
        userName,
        items,
    };

    await storeBasket(updatedBasket);
    return await getBasket(userName);
}

export async function updateItemVariant(
    productId: string,
    oldVariant: string,
    newVariant: string,
    newPrice?: number,
    userName: string = DEFAULT_USER,
): Promise<ShoppingCart> {
    const currentBasket = await getBasket(userName);
    let items = [...currentBasket.items];
    const resolvedProductId = toValidGuid(productId);

    const matchOld = (item: ShoppingCartItem) => {
        const idMatch =
            item.productId === productId ||
            item.productId === resolvedProductId;
        if (!idMatch) return false;
        const itemVar = item.variant || item.color || "Default";
        return itemVar === (oldVariant || "Default");
    };

    const oldIndex = items.findIndex(matchOld);
    if (oldIndex > -1) {
        const targetItem = items[oldIndex];

        const matchNew = (item: ShoppingCartItem, idx: number) => {
            if (idx === oldIndex) return false;
            const idMatch =
                item.productId === productId ||
                item.productId === resolvedProductId;
            if (!idMatch) return false;
            const itemVar = item.variant || item.color || "Default";
            return itemVar === (newVariant || "Default");
        };

        const existingNewIndex = items.findIndex((i, idx) => matchNew(i, idx));

        if (existingNewIndex > -1) {
            items[existingNewIndex].quantity += targetItem.quantity;
            items.splice(oldIndex, 1);
        } else {
            items[oldIndex] = {
                ...targetItem,
                color: newVariant,
                variant: newVariant,
                price:
                    newPrice !== undefined && !isNaN(newPrice)
                        ? newPrice
                        : targetItem.price,
            };
        }

        const updatedBasket: ShoppingCart = {
            userName,
            items,
        };

        await storeBasket(updatedBasket);
    }

    return await getBasket(userName);
}

export async function removeFromBasket(
    productId: string,
    color?: string,
    userName: string = DEFAULT_USER,
): Promise<ShoppingCart> {
    return await updateItemQuantity(productId, 0, color, userName);
}

export async function deleteBasket(
    userName: string = DEFAULT_USER,
): Promise<boolean> {
    const result = await fetchFromGateway<DeleteBasketResponse>(
        `/basket-service/basket/${userName}`,
        {
            method: "DELETE",
        },
    );

    revalidatePath("/cart");
    return result?.isSuccess ?? true;
}

export async function checkoutSelectedBasket(
    checkoutData: Omit<BasketCheckoutData, "userName" | "customerId"> & {
        customerId?: string;
    },
    selectedKeys?: Array<{ productId: string; variant: string }>,
    userName: string = DEFAULT_USER,
): Promise<{ success: boolean; message?: string }> {
    try {
        const currentBasket = await getBasket(userName);
        if (!currentBasket.items || currentBasket.items.length === 0) {
            return { success: false, message: "Your cart is empty." };
        }

        let itemsToCheckout = currentBasket.items;
        let remainingItems: ShoppingCartItem[] = [];

        if (selectedKeys && selectedKeys.length > 0) {
            const isSelected = (item: ShoppingCartItem) => {
                const itemVar = item.variant || item.color || "Default";
                return selectedKeys.some((s) => {
                    const resolvedSelectedId = toValidGuid(s.productId);
                    const idMatch =
                        item.productId === s.productId ||
                        item.productId === resolvedSelectedId;
                    const varMatch = (s.variant || "Default") === itemVar;
                    return idMatch && varMatch;
                });
            };

            itemsToCheckout = currentBasket.items.filter(isSelected);
            remainingItems = currentBasket.items.filter(
                (item) => !isSelected(item),
            );
        }

        if (itemsToCheckout.length === 0) {
            return {
                success: false,
                message: "No selected items to checkout.",
            };
        }

        const resolvedCustomerId = checkoutData.customerId
            ? toValidGuid(checkoutData.customerId)
            : "58c49479-ec65-4de2-86e7-033c546291aa"; // Default seeded customer

        const checkoutTotalPrice = itemsToCheckout.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        // If only a subset of items is selected, isolate them in the basket before calling checkout
        if (remainingItems.length > 0) {
            await storeBasket({
                userName,
                items: itemsToCheckout,
                totalPrice: checkoutTotalPrice,
            });
        }

        const fullPayload: BasketCheckoutData = {
            ...checkoutData,
            userName,
            customerId: resolvedCustomerId,
            totalPrice: checkoutTotalPrice,
        };

        const result = await fetchFromGateway<CheckoutBasketResponse>(
            `/basket-service/basket/checkout`,
            {
                method: "POST",
                body: JSON.stringify({ basketCheckoutDto: fullPayload }),
            },
        );

        if (result && result.isSuccess) {
            // Restore remaining unselected items into the user's basket
            if (remainingItems.length > 0) {
                await storeBasket({
                    userName,
                    items: remainingItems,
                });
            }

            revalidatePath("/cart");
            revalidatePath("/orders");
            return { success: true };
        }

        // Restore original basket if checkout failed
        if (remainingItems.length > 0) {
            await storeBasket(currentBasket);
        }

        return {
            success: false,
            message: "Checkout failed. Please try again.",
        };
    } catch (err: unknown) {
        const msg =
            err instanceof Error
                ? err.message
                : "An unexpected error occurred during checkout";
        return { success: false, message: msg };
    }
}

export async function checkoutBasket(
    checkoutData: Omit<BasketCheckoutData, "userName" | "customerId"> & {
        customerId?: string;
    },
    userName: string = DEFAULT_USER,
): Promise<{ success: boolean; message?: string }> {
    return await checkoutSelectedBasket(checkoutData, undefined, userName);
}

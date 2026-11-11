import {
    ShoppingCart,
    ShoppingCartItem,
    BasketCheckoutData,
    Product,
} from "@/types";

export type { ShoppingCart, ShoppingCartItem, BasketCheckoutData };

export interface SelectedCheckoutItemKey {
    productId: string;
    variant: string;
}

export interface VariantOption {
    title: string;
    price?: number;
}


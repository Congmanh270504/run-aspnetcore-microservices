"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { ShoppingCart, Product } from "@/types";
import {
  getBasket,
  addToBasket as addToBasketAction,
  updateItemQuantity as updateQuantityAction,
  updateItemVariant as updateVariantAction,
  removeFromBasket as removeFromBasketAction,
  deleteBasket as deleteBasketAction,
} from "@/features/(users)/cart";

interface CartContextType {
  cart: ShoppingCart;
  isLoading: boolean;
  totalItemsCount: number;
  userName: string;
  addToCart: (product: Product, quantity?: number, color?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, color?: string) => Promise<void>;
  updateVariant: (productId: string, oldVariant: string, newVariant: string, newPrice?: number) => Promise<void>;
  removeFromCart: (productId: string, color?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const userName = isLoaded && user ? (user.username || user.primaryEmailAddress?.emailAddress || user.id) : "swn";

  const [cart, setCart] = useState<ShoppingCart>({
    userName,
    items: [],
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentCart = await getBasket(userName);
      setCart(currentCart);
    } catch (err) {
      console.error("Failed to load basket:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    if (isLoaded) {
      refreshCart();
    }
  }, [isLoaded, userName, refreshCart]);

  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = async (product: Product, quantity: number = 1, color: string = "Black") => {
    try {
      setIsLoading(true);
      const updated = await addToBasketAction(product, quantity, color, userName);
      setCart(updated);
    } catch (err) {
      console.error("Failed to add to basket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, color?: string) => {
    try {
      setIsLoading(true);
      const updated = await updateQuantityAction(productId, quantity, color, userName);
      setCart(updated);
    } catch (err) {
      console.error("Failed to update item quantity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVariant = async (
    productId: string,
    oldVariant: string,
    newVariant: string,
    newPrice?: number
  ) => {
    try {
      setIsLoading(true);
      const updated = await updateVariantAction(productId, oldVariant, newVariant, newPrice, userName);
      setCart(updated);
    } catch (err) {
      console.error("Failed to update item variant:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, color?: string) => {
    try {
      setIsLoading(true);
      const updated = await removeFromBasketAction(productId, color, userName);
      setCart(updated);
    } catch (err) {
      console.error("Failed to remove item from basket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await deleteBasketAction(userName);
      setCart({
        userName,
        items: [],
        totalPrice: 0,
      });
    } catch (err) {
      console.error("Failed to clear basket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalItemsCount,
        userName,
        addToCart,
        updateQuantity,
        updateVariant,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

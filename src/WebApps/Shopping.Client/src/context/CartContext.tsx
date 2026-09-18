"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ShoppingCart, Product } from "@/types";
import {
  getBasket,
  addToBasket as addToBasketAction,
  updateItemQuantity as updateQuantityAction,
  removeFromBasket as removeFromBasketAction,
  deleteBasket as deleteBasketAction,
} from "@/actions/basketActions";

interface CartContextType {
  cart: ShoppingCart;
  isLoading: boolean;
  totalItemsCount: number;
  addToCart: (product: Product, quantity?: number, color?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShoppingCart>({
    userName: "swn",
    items: [],
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCart = async () => {
    try {
      const currentCart = await getBasket("swn");
      setCart(currentCart);
    } catch (err) {
      console.error("Failed to load basket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = async (product: Product, quantity: number = 1, color: string = "Black") => {
    try {
      setIsLoading(true);
      const updated = await addToBasketAction(product, quantity, color, "swn");
      setCart(updated);
    } catch (err) {
      console.error("Failed to add to basket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const updated = await updateQuantityAction(productId, quantity, "swn");
      setCart(updated);
    } catch (err) {
      console.error("Failed to update item quantity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setIsLoading(true);
      const updated = await removeFromBasketAction(productId, "swn");
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
      await deleteBasketAction("swn");
      setCart({
        userName: "swn",
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
        addToCart,
        updateQuantity,
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


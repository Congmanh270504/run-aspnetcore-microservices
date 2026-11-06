"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

interface Props {
  product: Product;
  quantity?: number;
  color?: string;
  className?: string;
  variant?: "default" | "success" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCartButton({
  product,
  quantity = 1,
  color = "Black",
  className,
  variant = "default",
  size = "sm",
}: Props) {
  const { addToCart } = useCart();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    try {
      await addToCart(product, quantity, color);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant={isSuccess ? "success" : variant}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          <span>Adding...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="h-4 w-4 mr-1.5 text-white" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
}


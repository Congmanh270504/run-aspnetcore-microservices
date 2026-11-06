"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Check, 
  Minus, 
  Plus, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const colors = ["Black", "Blue", "Red", "Green", "White"];
  const discountedPrice = Number(product.price) + 50;

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product, quantity, selectedColor);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      {product.category && (
        <div className="flex flex-wrap gap-2">
          {product.category.map((c) => (
            <Badge key={c} variant="secondary" className="px-3 py-1 text-xs">
              {c}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-black text-emerald-600">
          ${Number(product.price).toFixed(2)}
        </span>
        <span className="text-lg text-muted-foreground line-through">
          ${discountedPrice.toFixed(2)}
        </span>
        <Badge variant="success" className="text-xs">Save $50</Badge>
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-sm">
        {product.description}
      </p>

      {/* Color Selection */}
      <div className="space-y-2 pt-2 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Color: <span className="text-foreground">{selectedColor}</span>
        </label>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                selectedColor === color
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border hover:bg-accent text-muted-foreground"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity & Add to Cart */}
      <div className="space-y-3 pt-4 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quantity
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border rounded-md bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-bold text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="lg"
            variant={isSuccess ? "success" : "default"}
            className="flex-1 min-w-[200px] gap-2 font-semibold shadow-md"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Adding to Cart...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="h-5 w-5 text-white" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart ({quantity})</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/10">
          <Truck className="h-4 w-4 text-primary shrink-0" />
          <span>Fast Delivery</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/10">
          <RotateCcw className="h-4 w-4 text-primary shrink-0" />
          <span>30-Day Return</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/10">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>2-Year Warranty</span>
        </div>
      </div>
    </div>
  );
}


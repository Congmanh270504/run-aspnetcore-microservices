"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";

export function CartTable() {
  const { cart, updateQuantity, removeFromCart, isLoading, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16 border rounded-2xl bg-card space-y-4 max-w-md mx-auto my-8 p-8 shadow-sm">
        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground">
          Looks like you haven&apos;t added any items to your shopping cart yet.
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Items Table */}
      <div className="lg:col-span-8 space-y-4">
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[100px]">Product</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item) => (
                <TableRow key={`${item.productId}-${item.color}`}>
                  <TableCell>
                    <div className="h-16 w-16 rounded-md bg-muted/20 p-1 flex items-center justify-center border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/placeholder.png"
                        alt={item.productName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-sm hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Color: <span className="font-medium text-foreground">{item.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center border rounded-md bg-muted/20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={isLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ${Number(item.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm text-emerald-600">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => removeFromCart(item.productId)}
                      disabled={isLoading}
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link href="/products">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive text-xs"
            onClick={clearCart}
            disabled={isLoading}
          >
            Clear Entire Cart
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-4">
        <Card className="border shadow-sm sticky top-24">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${Number(cart.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-baseline">
              <span className="font-bold text-base">Total</span>
              <span className="font-extrabold text-2xl text-emerald-600">
                ${Number(cart.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/checkout" className="w-full block">
              <Button size="lg" className="w-full gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


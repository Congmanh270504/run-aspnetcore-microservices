import React from "react";
import Link from "next/link";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Checkout - EShop Microservices",
};

export default function CheckoutPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/cart" className="hover:text-foreground">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Checkout</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-xs text-muted-foreground mt-1">Please enter your shipping and payment details to complete the purchase.</p>
      </div>

      <CheckoutForm />
    </div>
  );
}


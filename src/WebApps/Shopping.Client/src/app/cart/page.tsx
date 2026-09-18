import React from "react";
import Link from "next/link";
import { CartTable } from "@/components/cart/CartTable";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Your Shopping Cart - EShop Microservices",
};

export default function CartPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Shopping Cart</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-muted-foreground mt-1">Review your selected items and proceed to checkout.</p>
      </div>

      <CartTable />
    </div>
  );
}


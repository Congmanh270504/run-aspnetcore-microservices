import React from "react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Add New Product - Admin Portal",
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">New Product</span>
      </nav>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Add New Product</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Fill in the details below to add a new product to CatalogDb.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}


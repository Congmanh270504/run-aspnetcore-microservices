import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/catalogActions";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

interface Props {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const imageUrl = product.imageFile
    ? `/images/product/${product.imageFile}`
    : "/images/placeholder.png";

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Image Gallery */}
        <div className="lg:col-span-6 rounded-2xl border bg-slate-50/50 p-8 flex items-center justify-center min-h-[420px] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-[380px] w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Product Details Form */}
        <div className="lg:col-span-6">
          <ProductDetailClient product={product} />
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { createProduct, updateProduct } from "@/actions/catalogActions";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  initialProduct?: Product;
}

export function ProductForm({ initialProduct }: Props) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    categoriesStr: initialProduct?.category?.join(", ") || "Smart Phone",
    description: initialProduct?.description || "",
    imageFile: initialProduct?.imageFile || "product-1.png",
    price: initialProduct?.price ? String(initialProduct.price) : "199.99",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableImages = [
    "product-1.png",
    "product-2.png",
    "product-3.png",
    "product-4.png",
    "product-5.png",
    "product-6.png",
    "placeholder.png",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const categories = formData.categoriesStr
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage("Please enter a valid price greater than 0");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing && initialProduct) {
        const res = await updateProduct({
          id: initialProduct.id,
          name: formData.name,
          category: categories,
          description: formData.description,
          imageFile: formData.imageFile,
          price: priceNum,
        });

        if (res.success) {
          router.push("/admin/products");
        } else {
          setErrorMessage(res.error || "Failed to update product");
        }
      } else {
        const res = await createProduct({
          name: formData.name,
          category: categories,
          description: formData.description,
          imageFile: formData.imageFile,
          price: priceNum,
        });

        if (res.success) {
          router.push("/admin/products");
        } else {
          setErrorMessage(res.error || "Failed to create product");
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-bold">
            {isEditing ? `Edit Product: ${initialProduct.name}` : "Create New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Product Name *</label>
            <Input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            />
          </div>

          {/* Categories & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Categories (comma-separated) *
              </label>
              <Input
                required
                name="categoriesStr"
                value={formData.categoriesStr}
                onChange={handleChange}
                placeholder="Smart Phone, Electronics"
              />
              <span className="text-[11px] text-muted-foreground">
                Separate multiple categories with commas.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Price (USD $) *</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="299.99"
              />
            </div>
          </div>

          {/* Image Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Product Image</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableImages.map((img) => (
                <div
                  key={img}
                  onClick={() => setFormData({ ...formData, imageFile: img })}
                  className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    formData.imageFile === img
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 bg-card"
                  }`}
                >
                  <div className="h-16 w-16 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/product/${img}`}
                      alt={img}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
                    {img}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Description *</label>
            <textarea
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of features, specs, and benefits..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t bg-muted/10 flex items-center justify-between">
          <Link href="/admin/products">
            <Button variant="outline" type="button" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Button>
          </Link>
          <Button type="submit" size="sm" className="gap-2 font-semibold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? "Update Product" : "Create Product"}</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}


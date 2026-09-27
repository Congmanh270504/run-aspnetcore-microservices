import React from "react";
import Link from "next/link";
import { getProducts } from "@/features/products/actions/catalogActions";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Testimonials from "@/components/landing/Testimonials";
import CTABanner from "@/components/landing/CTABanner";

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  const products = await getProducts(1, 20);

  const topProduct = products[0];
  const latestProducts = products.slice(0, 4);
  const bestProducts = products.length > 4 ? products.slice(-4) : products;

  return (
    <div className="space-y-12 pb-12">
      {/* Landing Page Hero Section */}
      <Hero topProduct={topProduct} />

      {/* Landing Page Features */}
      <Features />

      {/* Catalog Product Showcase - Latest Products */}
      <section className="max-w-screen-xl mx-auto px-6 space-y-6 pt-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 bg-primary rounded-full"></div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Latest Products
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Freshly added items to our store catalog
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground">
            No products available at the moment.
          </div>
        )}
      </section>

      {/* Best Selling Products */}
      {bestProducts.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 bg-amber-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Best Selling Tech
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top-rated customer favorite gadgets
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestProducts.map((p) => (
              <ProductCard key={`best-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Landing Page Pricing Tiers */}
      <Pricing />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Customer Testimonials Marquee */}
      <Testimonials />

      {/* Call To Action Banner */}
      <CTABanner />
    </div>
  );
}

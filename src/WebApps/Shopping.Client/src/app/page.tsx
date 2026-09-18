import React from "react";
import Link from "next/link";
import { getProducts } from "@/actions/catalogActions";
import { ProductCard } from "@/components/product/ProductCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, ArrowRight, ShoppingBag, ShieldCheck, Truck, Headphones } from "lucide-react";

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  const products = await getProducts(1, 20);

  const topProduct = products[0];
  const lastProducts = products.slice(0, 4);
  const bestProducts = products.length > 4 ? products.slice(-4) : products;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section & Top Product */}
      <section className="bg-gradient-to-b from-slate-50 to-background border-b py-10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Main Hero Banner */}
            <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl bg-slate-950 text-white p-8 md:p-12 relative overflow-hidden shadow-xl min-h-[360px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/banner/banner1.png"
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative z-10 space-y-4 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground border border-primary/30">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  New Microservices Architecture
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Discover the Best Tech & Gadgets.
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Powered by ASP.NET Core 8 Microservices, Next.js App Router, Tailwind CSS, and Server Actions.
                </p>
              </div>

              <div className="relative z-10 pt-6 flex flex-wrap gap-4 items-center">
                <Link href="/products">
                  <Button size="lg" className="gap-2 font-semibold shadow-md">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" size="lg" className="text-black">
                    Track Orders
                  </Button>
                </Link>
              </div>
            </div>

            {/* Top Product Featured Card */}
            <div className="lg:col-span-4 flex flex-col">
              {topProduct ? (
                <Card className="h-full flex flex-col justify-between border-2 border-primary/20 shadow-md">
                  <CardHeader className="bg-primary/5 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-amber-500" /> Featured Top Pick
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Best Value
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col items-center text-center justify-center space-y-4">
                    <div className="relative w-44 h-44 bg-slate-50 rounded-xl flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={topProduct.imageFile ? `/images/product/${topProduct.imageFile}` : "/images/placeholder.png"}
                        alt={topProduct.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground hover:text-primary">
                        <Link href={`/products/${topProduct.id}`}>{topProduct.name}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {topProduct.description}
                      </p>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">
                      ${Number(topProduct.price).toFixed(2)}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Link href={`/products/${topProduct.id}`} className="w-full block">
                      <Button variant="outline" className="w-full font-semibold">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <Card className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground border-dashed">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="font-medium">No products loaded yet</p>
                  <p className="text-xs mt-1">Please ensure Catalog.API is running</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-xl border bg-card shadow-sm">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-muted-foreground mt-0.5">On all orders over $99</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl border bg-card shadow-sm">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Secure Payment</h4>
              <p className="text-xs text-muted-foreground mt-0.5">100% secure payment gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl border bg-card shadow-sm">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">24/7 Dedicated Support</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Live chat & phone support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold tracking-tight">Latest Products</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {lastProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lastProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No products available at the moment.
          </div>
        )}
      </section>

      {/* Best Products */}
      {bestProducts.length > 0 && (
        <section className="container space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
              <h2 className="text-2xl font-bold tracking-tight">Best Selling Products</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
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
    </div>
  );
}


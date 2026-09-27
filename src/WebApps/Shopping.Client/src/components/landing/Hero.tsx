import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sparkles, Trophy, ArrowRight, ShoppingBag } from "lucide-react";
import LogoCloud from "./LogoCloud";
import { Product } from "@/types";

interface HeroProps {
  topProduct?: Product;
}

export default function Hero({ topProduct }: HeroProps) {
  return (
    <div className="relative overflow-hidden py-12 xs:py-16 px-6 bg-gradient-to-b from-background via-slate-50/50 to-background dark:via-background/50 border-b">
      <div className="max-w-screen-xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text / Main Hero */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="flex items-center">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                ASP.NET Core 8 Microservices Architecture 🚀
              </span>
            </div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-foreground">
              Discover Next-Gen Tech & Premium Gadgets
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              Experience ultra-fast shopping powered by ASP.NET Core 8 Microservices,
              Next.js 14 App Router, Tailwind CSS, and Real-Time Event Messaging.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full font-bold gap-2 text-base shadow-md px-8">
                  Shop Catalog Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full font-semibold text-base px-6">
                  Explore Perks
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Featured Product Card */}
          <div className="lg:col-span-5">
            {topProduct ? (
              <Card className="rounded-3xl border-2 border-primary/20 shadow-xl overflow-hidden bg-background">
                <CardHeader className="bg-primary/5 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-amber-500" /> Featured Top Pick
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      Best Value
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="relative w-48 h-48 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center p-3 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        topProduct.imageFile
                          ? `/images/product/${topProduct.imageFile}`
                          : "/images/placeholder.png"
                      }
                      alt={topProduct.name}
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-foreground hover:text-primary transition-colors">
                      <Link href={`/products/${topProduct.id}`}>
                        {topProduct.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 max-w-xs">
                      {topProduct.description}
                    </p>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    ${Number(topProduct.price).toFixed(2)}
                  </div>
                  <Link href={`/products/${topProduct.id}`} className="w-full">
                    <Button variant="outline" className="w-full font-bold rounded-xl">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl p-8 text-center text-muted-foreground border-dashed">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-bold">Catalog Service Ready</p>
                <p className="text-xs mt-1">Explore our wide selection of tech products</p>
              </Card>
            )}
          </div>
        </div>

        {/* Logo Cloud Section */}
        <LogoCloud className="pt-4" />
      </div>
    </div>
  );
}

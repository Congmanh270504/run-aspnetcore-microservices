import React from "react";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CTABanner() {
  return (
    <div className="px-6 py-12">
      <div className="relative overflow-hidden my-12 w-full bg-slate-950 text-white dark:border max-w-screen-xl mx-auto rounded-3xl py-12 md:py-16 px-6 md:px-14 shadow-2xl">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.15}
          duration={3}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_right,white,rgba(255,255,255,0.6),transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-white stroke-white"
          )}
        />
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.15}
          duration={3}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_top_left,white,rgba(255,255,255,0.6),transparent)]",
            "inset-x-0 inset-y-0 h-[200%] skew-y-12 fill-white stroke-white"
          )}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground border border-primary/30">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Special Promotion Active
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Upgrade Your Tech Setup?
            </h3>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Discover cutting-edge gadgets, high-performance electronics, and exclusive member discounts today.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-base shadow-lg">
                Explore All Products <ArrowUpRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-black border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-base">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

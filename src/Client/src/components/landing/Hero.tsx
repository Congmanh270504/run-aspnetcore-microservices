import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

interface HeroProps {
  topProduct?: Product;
}

export default function Hero({ topProduct }: HeroProps) {
  return (
    <section className="w-full relative overflow-hidden bg-stone-900">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Column: The Holiday Collection */}
        <div className="relative group overflow-hidden h-[62vh] sm:h-[72vh] md:h-[calc(100vh-5rem)] min-h-[500px] max-h-[850px] cursor-pointer">
          <Link
            href="/products?category=Holiday"
            className="absolute inset-0 z-10"
            aria-label="Discover The Holiday Collection"
          />
          <Image
            src="/images/banner/holiday-left-clean.jpg"
            alt="The Holiday Collection"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Vignette / gradient overlay for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

          {/* Content overlay */}
          <div className="absolute inset-0 p-8 sm:p-12 lg:p-16 flex flex-col justify-end items-start z-20 pointer-events-none">
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal text-white tracking-tight leading-[1.15] mb-5 sm:mb-7 drop-shadow-sm">
              The Holiday Collection
            </h2>
            <Link
              href="/products?category=Holiday"
              className="pointer-events-auto inline-flex items-center justify-center px-6 py-2.5 text-xs sm:text-sm font-medium tracking-wider text-white uppercase border border-white hover:bg-white hover:text-black transition-all duration-300 bg-black/10 backdrop-blur-[2px]"
            >
              Discover Now
            </Link>
          </div>
        </div>

        {/* Right Column: Gift Guide – Holiday Edition */}
        <div className="relative group overflow-hidden h-[62vh] sm:h-[72vh] md:h-[calc(100vh-5rem)] min-h-[500px] max-h-[850px] cursor-pointer border-t md:border-t-0 md:border-l border-white/10">
          <Link
            href="/products?category=Gifts"
            className="absolute inset-0 z-10"
            aria-label="Discover Gift Guide – Holiday Edition"
          />
          <Image
            src="/images/banner/holiday-right-clean.jpg"
            alt="Gift Guide – Holiday Edition"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Vignette / gradient overlay for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

          {/* Content overlay */}
          <div className="absolute inset-0 p-8 sm:p-12 lg:p-16 flex flex-col justify-end items-start z-20 pointer-events-none">
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal text-white tracking-tight leading-[1.15] mb-5 sm:mb-7 drop-shadow-sm">
              Gift Guide – Holiday Edition
            </h2>
            <Link
              href="/products?category=Gifts"
              className="pointer-events-auto inline-flex items-center justify-center px-6 py-2.5 text-xs sm:text-sm font-medium tracking-wider text-white uppercase border border-white hover:bg-white hover:text-black transition-all duration-300 bg-black/10 backdrop-blur-[2px]"
            >
              Discover Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";

export function ProductDetailSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Top Product Detail Section (Images & Info) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left: 2-column Images Grid Skeleton */}
                <div className="lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-sm bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-sm bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-sm bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-sm bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>
                </div>

                {/* Right: Product Information Skeleton */}
                <div className="lg:col-span-5 flex flex-col space-y-6">
                    {/* Title & subtitle */}
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="h-8 sm:h-10 w-3/4 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="h-4 w-1/3 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>

                    {/* Description lines */}
                    <div className="space-y-2.5 pt-2">
                        <div className="h-3.5 w-full rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="h-3.5 w-5/6 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="h-3.5 w-4/6 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>

                    {/* Color Variants placeholder */}
                    <div className="pt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-28 h-12 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                            <div className="w-28 h-12 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                        </div>
                    </div>

                    {/* Specifications table */}
                    <div className="border-y border-neutral-200/90 dark:border-neutral-800 divide-y divide-neutral-200/90 dark:divide-neutral-800 pt-2">
                        <div className="flex justify-between py-3">
                            <div className="h-4 w-16 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                            <div className="h-4 w-20 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        </div>
                        <div className="flex justify-between py-3">
                            <div className="h-4 w-16 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                            <div className="h-4 w-12 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        </div>
                        <div className="flex justify-between py-3">
                            <div className="h-4 w-16 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                            <div className="h-4 w-28 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        </div>
                    </div>

                    {/* Action buttons: Quantity stepper + Add to Cart */}
                    <div className="flex items-center gap-4 pt-2">
                        <div className="w-28 h-12 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="flex-1 h-12 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>
                </div>
            </div>

            {/* FAQ Skeleton */}
            <div className="mt-24 pt-12 border-t border-neutral-200/90 dark:border-neutral-800">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    <div className="lg:col-span-4">
                        <div className="h-8 w-48 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>
                    <div className="lg:col-span-8 space-y-4">
                        <div className="h-12 w-full rounded border border-neutral-200/90 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="h-12 w-full rounded border border-neutral-200/90 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="h-12 w-full rounded border border-neutral-200/90 dark:border-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50" />
                    </div>
                </div>
            </div>

            {/* Popular Selection Skeleton */}
            <div className="mt-20 pt-10 border-t border-neutral-200/90 dark:border-neutral-800 space-y-6">
                <div className="flex justify-between items-baseline">
                    <div className="h-8 w-44 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                    <div className="h-4 w-32 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] w-full rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
                            <div className="h-4 w-3/4 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                            <div className="h-4 w-1/3 rounded bg-neutral-200/80 dark:bg-neutral-800" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProductDetailSkeleton;

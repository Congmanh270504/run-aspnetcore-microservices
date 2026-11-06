import React from "react";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
                {/* Sidebar skeleton */}
                <div className="hidden lg:block lg:col-span-1 space-y-7">
                    <div className="h-7 w-36 rounded-md bg-stone-200" />
                    
                    <div className="space-y-3 pt-6 border-t border-stone-200">
                        <div className="h-4 w-28 rounded bg-stone-200" />
                        <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-4 w-4 rounded bg-stone-200" />
                                    <div className="h-4 w-24 rounded bg-stone-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-stone-200">
                        <div className="h-4 w-28 rounded bg-stone-200" />
                        <div className="h-6 w-32 rounded bg-stone-200" />
                        <div className="h-2 w-full rounded bg-stone-200" />
                    </div>
                </div>

                {/* Main Content skeleton */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Top bar skeleton */}
                    <div className="flex items-center justify-between py-2">
                        <div className="h-5 w-48 rounded bg-stone-200" />
                        <div className="h-9 w-40 rounded-lg bg-stone-200" />
                    </div>

                    {/* Active chips skeleton */}
                    <div className="flex items-center gap-2 py-1">
                        <div className="h-5 w-20 rounded bg-stone-200" />
                        <div className="h-7 w-28 rounded-md bg-stone-200" />
                        <div className="h-7 w-24 rounded-md bg-stone-200" />
                    </div>

                    {/* Cards grid skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col justify-between rounded-3xl bg-white p-2 border border-stone-100"
                            >
                                <div className="aspect-[4/5] w-full rounded-2xl bg-stone-200" />
                                <div className="pt-3 pb-1 px-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="h-3 w-16 rounded bg-stone-200" />
                                        <div className="h-3 w-10 rounded bg-stone-200" />
                                    </div>
                                    <div className="h-4 w-3/4 rounded bg-stone-200" />
                                    <div className="h-5 w-20 rounded bg-stone-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

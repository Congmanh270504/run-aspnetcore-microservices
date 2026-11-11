import React from "react";

export default function CartLoading() {
    return (
        <div className="container p-8 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 gap-8 items-start">
                {/* Cart Items Table skeleton */}
                <div className="space-y-4">
                    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                        {/* Table Header skeleton */}
                        <div className="bg-muted/40 p-4 border-b flex items-center justify-between">
                            <div className="h-4 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                            <div className="h-4 w-28 rounded bg-stone-200 dark:bg-stone-700 hidden sm:block" />
                            <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                            <div className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-700" />
                            <div className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-700" />
                            <div className="h-4 w-6 rounded bg-stone-200 dark:bg-stone-700" />
                        </div>

                        {/* Table Rows skeleton */}
                        <div className="divide-y divide-border">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-md bg-stone-200 dark:bg-stone-700 shrink-0" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-36 sm:w-48 rounded bg-stone-200 dark:bg-stone-700" />
                                            <div className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                                        </div>
                                    </div>
                                    <div className="h-8 w-24 rounded-md bg-stone-200 dark:bg-stone-700 hidden sm:block" />
                                    <div className="h-4 w-14 rounded bg-stone-200 dark:bg-stone-700 hidden md:block" />
                                    <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-8 w-8 rounded-md bg-stone-200 dark:bg-stone-700 shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar skeleton */}
                <div className="w-full bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-36 rounded-xl bg-stone-200 dark:bg-stone-700" />
                            <div className="h-9 w-28 rounded-xl bg-stone-200 dark:bg-stone-700" />
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-32 rounded bg-stone-200 dark:bg-stone-700 ml-auto" />
                                <div className="h-6 w-24 rounded bg-stone-200 dark:bg-stone-700 ml-auto" />
                            </div>
                            <div className="h-12 w-44 rounded-xl bg-stone-200 dark:bg-stone-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

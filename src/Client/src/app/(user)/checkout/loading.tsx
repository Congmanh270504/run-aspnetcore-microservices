import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutLoading() {
    return (
        <div className="container p-8 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Billing & Shipping and Payment skeleton */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Billing Address Card skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="h-6 w-56 rounded bg-stone-200 dark:bg-stone-700" />
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-28 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method Card skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="h-6 w-44 rounded bg-stone-200 dark:bg-stone-700" />
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-3 w-28 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-12 rounded bg-stone-200 dark:bg-stone-700" />
                                    <div className="h-10 w-full rounded-md bg-stone-200 dark:bg-stone-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary skeleton */}
                <div className="lg:col-span-4">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="h-6 w-36 rounded bg-stone-200 dark:bg-stone-700" />
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center py-1"
                                    >
                                        <div className="space-y-1">
                                            <div className="h-4 w-32 rounded bg-stone-200 dark:bg-stone-700" />
                                            <div className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                                        </div>
                                        <div className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-700" />
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-2" />

                            <div className="flex justify-between py-1">
                                <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-4 w-14 rounded bg-stone-200 dark:bg-stone-700" />
                            </div>
                            <div className="flex justify-between py-1">
                                <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-700" />
                            </div>

                            <Separator className="my-2" />

                            <div className="flex justify-between py-1">
                                <div className="h-5 w-14 rounded bg-stone-200 dark:bg-stone-700" />
                                <div className="h-6 w-20 rounded bg-stone-200 dark:bg-stone-700" />
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0">
                            <div className="h-11 w-full rounded-lg bg-stone-200 dark:bg-stone-700" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

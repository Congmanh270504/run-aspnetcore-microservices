"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePickerSimple } from "@/components/DatePickerSimple";
import { couponSchema, type CouponFormValues } from "../schema";
import { createDiscount, updateDiscount } from "../actions/discountActions";
import type { Coupon, Product } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: Coupon | null;
    products?: Product[];
    onSuccess?: () => void;
}

export function DiscountDialog({
    open,
    onOpenChange,
    item,
    products = [],
    onSuccess,
}: Props) {
    const isEdit = !!item;

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            productName: "",
            description: "",
            amount: 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    useEffect(() => {
        if (open) {
            const now = new Date();
            const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            form.reset(
                item
                    ? {
                          productName: item.productName,
                          description: item.description,
                          amount: item.amount,
                          startDate: item.startDate
                              ? new Date(item.startDate)
                              : now,
                          endDate: item.endDate
                              ? new Date(item.endDate)
                              : defaultEnd,
                      }
                    : {
                          productName: "",
                          description: "",
                          amount: 0,
                          startDate: now,
                          endDate: defaultEnd,
                      },
            );
        }
    }, [open, item, form]);

    const onSubmit = async (values: CouponFormValues) => {
        const payload = {
            ...values,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
        };

        const result = isEdit
            ? await updateDiscount({ id: item!.id, ...payload })
            : await createDiscount(payload);

        if (result.success) {
            toast.success(
                isEdit
                    ? "Coupon updated successfully!"
                    : "Coupon created successfully!",
            );
            onSuccess?.();
        } else {
            toast.error(result.error || "Failed to save discount coupon");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-lg p-0 gap-0">
                {/* HEADER with Emerald/Teal gradient as per TNT Dialog skill */}
                <DialogHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 rounded-t-lg">
                    <DialogTitle className="text-2xl font-bold text-white">
                        {isEdit
                            ? "Edit Discount Coupon"
                            : "Add New Discount Coupon"}
                    </DialogTitle>
                    <DialogDescription className="text-emerald-50 text-sm">
                        {isEdit
                            ? "Update discount amount, description and validity period."
                            : "Create a discount coupon linked to a specific product."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="discount-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 px-6 pt-6 pb-4"
                    >
                        {/* Product Name Selection / Input */}
                        <FormField
                            control={form.control}
                            name="productName"
                            render={({ field }) => {
                                const productOptions = Array.from(
                                    new Set([
                                        ...(field.value ? [field.value] : []),
                                        ...products.map((p) => p.name),
                                    ]),
                                );

                                return (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-slate-800">
                                            Product Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <Select
                                            key={`${open}-${item?.id ?? "new"}-${field.value}`}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="-- Select product or enter custom name --" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                {productOptions.map((name) => (
                                                    <SelectItem
                                                        key={name}
                                                        value={name}
                                                    >
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-800">
                                        Description{" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Summer sale discount"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Amount */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-800">
                                        Discount Amount ($){" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 150"
                                            value={field.value ?? 0}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.valueAsNumber || 0,
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Validity Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <DatePickerSimple
                                            label="Start time"
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            showTime
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <DatePickerSimple
                                            label="End time"
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            showTime
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>

                <DialogFooter className="px-6 pb-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={form.formState.isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        onClick={() => {
                            const formEl = document.querySelector(
                                "#discount-form",
                            ) as HTMLFormElement;
                            if (formEl) formEl.requestSubmit();
                        }}
                    >
                        {form.formState.isSubmitting
                            ? "Saving..."
                            : isEdit
                              ? "Update Coupon"
                              : "Create Coupon"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

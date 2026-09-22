"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { productSchema, type ProductFormValues } from "../schema";
import {
    createProduct,
    updateProduct,
} from "@/features/products/actions/catalogActions";
import type { Product } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSuccess?: () => void;
}

const AVAILABLE_IMAGES = [
    "product-1.png",
    "product-2.png",
    "product-3.png",
    "product-4.png",
    "product-5.png",
    "product-6.png",
    "placeholder.png",
];

export function ProductDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: Props) {
    const isEdit = !!product;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            categoriesStr: "Smart Phone",
            price: 199.99,
            imageFile: "product-1.png",
            description: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name || product.title || "",
                    categoriesStr:
                        product.category?.join(", ") ||
                        product.product_type ||
                        "Smart Phone",
                    price: Number(
                        product.price ?? product.variants?.[0]?.price ?? 199.99,
                    ),
                    imageFile: product.imageFile || "product-1.png",
                    description: product.description || product.body_html || "",
                });
            } else {
                form.reset({
                    name: "",
                    categoriesStr: "Smart Phone",
                    price: 199.99,
                    imageFile: "product-1.png",
                    description: "",
                });
            }
        }
    }, [open, product, form]);

    const onSubmit = async (values: ProductFormValues) => {
        const categories = values.categoriesStr
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        if (isEdit && product) {
            const res = await updateProduct({
                id: product.id,
                name: values.name,
                category: categories,
                description: values.description,
                imageFile: values.imageFile,
                price: values.price,
            });

            if (res.success) {
                toast.success("Product updated successfully!");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(res.error || "Failed to update product");
            }
        } else {
            const res = await createProduct({
                name: values.name,
                category: categories,
                description: values.description,
                imageFile: values.imageFile,
                price: values.price,
            });

            if (res.success) {
                toast.success("Product created successfully!");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(res.error || "Failed to create product");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-xl gap-0 overflow-hidden border shadow-2xl">
                {/* Header — Blue/Indigo gradient for product catalog domain */}
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-xl shrink-0">
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        {isEdit ? "Edit Product" : "Create New Product"}
                    </DialogTitle>
                    <DialogDescription className="text-white/85 text-sm mt-1">
                        {isEdit
                            ? "Update product details, pricing, and catalog categories."
                            : "Add a new product to the catalog service."}
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                    <Form {...form}>
                        <form
                            id="product-form"
                            onSubmit={form.handleSubmit(onSubmit as any)}
                            className="space-y-4"
                        >
                            {/* Product Name */}
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                            Product Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Sony WH-1000XM5 Headphones"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Categories & Price */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="categoriesStr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                                Categories (comma-separated) *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Smart Phone, Electronics"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                                Price (USD $) *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="299.99"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Image Selector */}
                            <FormField
                                control={form.control as any}
                                name="imageFile"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                            Product Image *
                                        </FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                                {AVAILABLE_IMAGES.map((img) => {
                                                    const isSelected =
                                                        field.value === img;
                                                    return (
                                                        <div
                                                            key={img}
                                                            onClick={() =>
                                                                field.onChange(
                                                                    img,
                                                                )
                                                            }
                                                            className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                                                                isSelected
                                                                    ? "border-primary bg-primary/10 shadow-xs"
                                                                    : "border-border hover:border-muted-foreground/40 bg-card"
                                                            }`}
                                                        >
                                                            <div className="h-14 w-14 flex items-center justify-center">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={`/images/product/${img}`}
                                                                    alt={img}
                                                                    className="max-h-full max-w-full object-contain"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.target as HTMLImageElement
                                                                        ).src =
                                                                            "/images/placeholder.png";
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
                                                                {img}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control as any}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                            Description *
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Detailed specifications and key features..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                {/* Dialog Footer */}
                <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={form.formState.isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="product-form"
                        disabled={form.formState.isSubmitting}
                        className="bg-primary hover:bg-primary/90 min-w-[100px]"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : isEdit ? (
                            "Update Product"
                        ) : (
                            "Create Product"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Package,
    Loader2,
    Plus,
    Trash2,
    Layers,
    Image as ImageIcon,
    Check,
} from "lucide-react";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import FormMultiSelect from "@/components/FormMultiSelect";
import MultiImageUpload from "@/components/MultiImageUpload";

import { productSchema, type ProductFormValues } from "../schema";

import type { Product } from "@/types";
import { createProduct, updateProduct } from "../actions/catalogActions";
import { getProductTypeRows } from "../../categories/actions/categoryActions";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    categoriesList?: string[];
    productTypesList?: string[];
    onSuccess?: () => void;
}

function formatImageSrc(src?: string): string {
    if (!src) return "/images/placeholder.png";
    if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:")
    ) {
        return src;
    }
    if (src.startsWith("/")) {
        return src;
    }
    return `/images/product/${src}`;
}

const EMPTY_LIST: string[] = [];

export function ProductDialog({
    open,
    onOpenChange,
    product,
    categoriesList = EMPTY_LIST,
    productTypesList = EMPTY_LIST,
    onSuccess,
}: Props) {
    const isEdit = !!product;
    const [productTypeOptions, setProductTypeOptions] =
        useState<string[]>(productTypesList);

    useEffect(() => {
        let isMounted = true;
        if (open) {
            if (productTypesList && productTypesList.length > 0) {
                setProductTypeOptions(productTypesList);
            } else {
                getProductTypeRows().then((rows) => {
                    if (isMounted) {
                        setProductTypeOptions(rows.map((r) => r.name));
                    }
                });
            }
        }
        return () => {
            isMounted = false;
        };
    }, [open]);

    // Build selectable category options
    const categoryOptions = useMemo(() => {
        const combined = new Set(categoriesList);
        return Array.from(combined).map((cat) => ({
            label: cat,
            value: cat,
        }));
    }, [categoriesList]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            category: ["Smart Phone"],
            images: [],
            imageFile: "",
            description: "",
            variants: [
                {
                    title: "Default Title",
                    price: 199.99,
                    grams: 0,
                    sku: "",
                    featured_image: "",
                },
            ],
        },
    });

    const {
        fields: variantFields,
        append: appendVariant,
        remove: removeVariant,
    } = useFieldArray({
        control: form.control,
        name: "variants",
    });

    const uploadedImages = form.watch("images") || [];

    useEffect(() => {
        if (open) {
            if (product) {
                const ptName =
                    typeof product.product_type === "string"
                        ? product.product_type
                        : product.product_type?.name;

                const initialCategories =
                    product.category && product.category.length > 0
                        ? product.category
                        : ptName
                          ? [ptName]
                          : ["Smart Phone"];

                const initialImages =
                    product.images && product.images.length > 0
                        ? product.images
                              .map((img: any) =>
                                  typeof img === "string"
                                      ? img
                                      : img.src || img.url || "",
                              )
                              .filter(Boolean)
                        : product.imageFile
                          ? [product.imageFile]
                          : [];

                const initialVariants =
                    product.variants && product.variants.length > 0
                        ? product.variants.map((v: any) => {
                              const featImg =
                                  typeof v.featured_image === "string"
                                      ? v.featured_image
                                      : v.featured_image?.src ||
                                        v.imageFile ||
                                        "";
                              return {
                                  id: v.id ? String(v.id) : undefined,
                                  title:
                                      v.title || v.option1 || "Default Title",
                                  price: Number(v.price ?? product.price ?? 0),
                                  grams: Number(v.grams ?? 0),
                                  sku: v.sku || "",
                                  featured_image: featImg,
                              };
                          })
                        : [
                              {
                                  title: "Default Title",
                                  price: Number(product.price ?? 199.99),
                                  grams: 0,
                                  sku: "",
                                  featured_image: "",
                              },
                          ];

                const currentPt =
                    typeof product.product_type === "string"
                        ? product.product_type
                        : product.product_type?.name || "";

                form.reset({
                    name: product.name || product.title || "",
                    product_type: currentPt,
                    category: initialCategories,
                    images: initialImages,
                    imageFile: initialImages[0] || product.imageFile || "",
                    description: product.description || product.body_html || "",
                    variants: initialVariants,
                });
            } else {
                form.reset({
                    name: "",
                    product_type: "",
                    category: ["Smart Phone"],
                    images: [],
                    imageFile: "",
                    description: "",
                    variants: [
                        {
                            title: "Default Title",
                            price: 199.99,
                            sku: "",
                            featured_image: "",
                        },
                    ],
                });
            }
        }
    }, [open, product, form]);

    const onSubmit = async (values: ProductFormValues) => {
        const primaryImage = values.images?.[0] || values.imageFile || "";
        const mainPrice = values.variants?.[0]?.price ?? 0;

        const productTypeObj = values.product_type
            ? { id: 0, name: values.product_type, sort_order: 0 }
            : undefined;

        const payload = {
            name: values.name,
            product_type: productTypeObj,
            productType: productTypeObj,
            category: values.category,
            description: values.description,
            imageFile: primaryImage,
            images: values.images || [],
            price: mainPrice,
            variants: values.variants.map((v) => ({
                ...v,
                featured_image: v.featured_image
                    ? { src: v.featured_image }
                    : null,
            })),
        };

        if (isEdit && product) {
            const res = await updateProduct({
                id: product.id,
                ...payload,
            });

            if (res.success) {
                toast.success("Product updated successfully!");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(res.error || "Could not update product");
            }
        } else {
            const res = await createProduct(payload);

            if (res.success) {
                toast.success("Product created successfully!");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(res.error || "Could not create product");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 rounded-xl gap-0 overflow-hidden border-none shadow-2xl">
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4  shrink-0">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription className="text-white/85 text-xs mt-0.5">
                        {isEdit
                            ? "Update product details, images, categories, and variants."
                            : "Enter new product details to add to Catalog Service."}
                    </DialogDescription>
                </DialogHeader>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0 space-y-5">
                    <Form {...form}>
                        <form
                            id="product-form"
                            onSubmit={form.handleSubmit(onSubmit as any)}
                            className="space-y-5"
                        >
                            {/* Product Name */}
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                            Product Name{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-4 gap-2 items-start">
                                {/* Categories */}
                                <FormField
                                    control={form.control as any}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="col-span-3">
                                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                                Tags{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <FormMultiSelect
                                                    options={categoryOptions}
                                                    placeholder="-- Select tags --"
                                                    value={field.value || []}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Product Type Select */}
                                <FormField
                                    control={form.control as any}
                                    name="product_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                                Product Type{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10 text-sm">
                                                        <SelectValue placeholder="-- Types --" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {productTypeOptions.map(
                                                        (pt) => (
                                                            <SelectItem
                                                                key={pt}
                                                                value={pt}
                                                            >
                                                                {pt}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control as any}
                                name="images"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                                            Product Images
                                        </FormLabel>
                                        <FormControl>
                                            <MultiImageUpload
                                                value={field.value || []}
                                                onChange={(urls) => {
                                                    field.onChange(urls);
                                                    form.setValue(
                                                        "imageFile",
                                                        urls[0] || "",
                                                    );
                                                }}
                                                folder="run-aspnet-microservice/products"
                                                maxFiles={8}
                                            />
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
                                            Description{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Detailed description of specifications, key features..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Product Variants Section */}
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <Layers className="w-4 h-4 text-primary" />
                                            Product Variants{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Manage product versions with
                                            corresponding prices and SKUs.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
                                        onClick={() =>
                                            appendVariant({
                                                title: `Variant ${variantFields.length + 1}`,
                                                price: 199.99,
                                                grams: 0,
                                                sku: "",
                                                featured_image: "",
                                            })
                                        }
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add
                                        Variant
                                    </Button>
                                </div>

                                <div className="space-y-2.5">
                                    {variantFields.map((variantItem, idx) => {
                                        const variantImage = form.watch(
                                            `variants.${idx}.featured_image` as const,
                                        );

                                        return (
                                            <div
                                                key={variantItem.id}
                                                className="p-3 bg-muted/20 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
                                            >
                                                {/* Variant Image Selector */}
                                                <div className="space-y-1 shrink-0 self-start sm:self-center">
                                                    <label className="text-[11px] font-semibold text-muted-foreground block sm:hidden">
                                                        Variant Image
                                                    </label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="w-10 h-10 rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-background flex flex-col items-center justify-center relative overflow-hidden transition-all group/img cursor-pointer shrink-0 mt-0 sm:mt-4"
                                                                title="Select featured image for this variant"
                                                            >
                                                                {variantImage ? (
                                                                    <>
                                                                        <img
                                                                            src={formatImageSrc(
                                                                                variantImage,
                                                                            )}
                                                                            alt={`Variant ${idx + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-semibold">
                                                                            Change
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center text-muted-foreground group-hover/img:text-primary transition-colors">
                                                                        <ImageIcon className="w-4 h-4" />
                                                                        <span className="text-[8px] font-medium leading-none mt-0.5">
                                                                            +Image
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-80 p-3 space-y-3 shadow-xl"
                                                            align="start"
                                                        >
                                                            <div className="flex items-center justify-between pb-2 border-b">
                                                                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                                                    Image for
                                                                    variant #
                                                                    {idx + 1}
                                                                </h4>
                                                                {variantImage && (
                                                                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                                        Assigned
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Pick from product uploaded images */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-semibold text-muted-foreground">
                                                                    Select from
                                                                    uploaded
                                                                    product
                                                                    images:
                                                                </label>
                                                                {uploadedImages.length >
                                                                0 ? (
                                                                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded-md bg-muted/20">
                                                                        {uploadedImages.map(
                                                                            (
                                                                                imgUrl,
                                                                                imgIdx,
                                                                            ) => {
                                                                                const isSelected =
                                                                                    variantImage ===
                                                                                    imgUrl;
                                                                                const formatted =
                                                                                    formatImageSrc(
                                                                                        imgUrl,
                                                                                    );
                                                                                return (
                                                                                    <button
                                                                                        key={`${imgUrl}-${imgIdx}`}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            form.setValue(
                                                                                                `variants.${idx}.featured_image`,
                                                                                                imgUrl,
                                                                                                {
                                                                                                    shouldDirty: true,
                                                                                                    shouldValidate: true,
                                                                                                },
                                                                                            );
                                                                                        }}
                                                                                        className={`relative aspect-square rounded border-2 overflow-hidden bg-background hover:scale-105 transition-all cursor-pointer ${
                                                                                            isSelected
                                                                                                ? "border-primary ring-2 ring-primary/30"
                                                                                                : "border-border hover:border-primary/50"
                                                                                        }`}
                                                                                    >
                                                                                        <img
                                                                                            src={
                                                                                                formatted
                                                                                            }
                                                                                            alt={`Option ${imgIdx + 1}`}
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                        {isSelected && (
                                                                                            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                                                                                                <Check className="w-3.5 h-3.5" />
                                                                                            </div>
                                                                                        )}
                                                                                    </button>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded text-center">
                                                                        No
                                                                        product
                                                                        images
                                                                        uploaded
                                                                        yet.
                                                                        Please
                                                                        upload
                                                                        images
                                                                        in the
                                                                        "Product
                                                                        Images"
                                                                        section
                                                                        above.
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Action buttons */}
                                                            {variantImage && (
                                                                <div className="pt-1 border-t flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 text-[11px] text-destructive hover:bg-destructive/10 px-2 cursor-pointer"
                                                                        onClick={() =>
                                                                            form.setValue(
                                                                                `variants.${idx}.featured_image`,
                                                                                "",
                                                                                {
                                                                                    shouldDirty: true,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        Remove
                                                                        Image
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {/* Variant Title */}
                                                <div className="flex-1 w-full space-y-1">
                                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                                        Variant Title
                                                    </label>
                                                    <Input
                                                        placeholder="e.g. 128GB / Black"
                                                        className="h-8 text-sm"
                                                        {...form.register(
                                                            `variants.${idx}.title` as const,
                                                        )}
                                                    />
                                                </div>

                                                {/* Variant Price */}
                                                <div className="w-full sm:w-28 space-y-1">
                                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                                        Price ($){" "}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="199.99"
                                                        className="h-8 text-sm"
                                                        {...form.register(
                                                            `variants.${idx}.price` as const,
                                                            {
                                                                valueAsNumber: true,
                                                            },
                                                        )}
                                                    />
                                                </div>

                                                {/* Variant Grams */}
                                                <div className="w-full sm:w-24 space-y-1">
                                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                                        Grams (g)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="0"
                                                        placeholder="140"
                                                        className="h-8 text-sm"
                                                        {...form.register(
                                                            `variants.${idx}.grams` as const,
                                                            {
                                                                valueAsNumber: true,
                                                            },
                                                        )}
                                                    />
                                                </div>

                                                {/* Variant SKU */}
                                                <div className="w-full sm:w-36 space-y-1">
                                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                                        SKU Code
                                                    </label>
                                                    <Input
                                                        placeholder="SKU-XXXX"
                                                        className="h-8 text-sm"
                                                        {...form.register(
                                                            `variants.${idx}.sku` as const,
                                                        )}
                                                    />
                                                </div>

                                                {/* Delete Variant Button */}
                                                {variantFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-center mt-2 sm:mt-4 cursor-pointer"
                                                        onClick={() =>
                                                            removeVariant(idx)
                                                        }
                                                        title="Remove variant"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Dialog Footer */}
                <DialogFooter className="px-6 py-3.5 border-t bg-muted/10 shrink-0">
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
                        className="bg-primary hover:bg-primary/90 min-w-[110px]"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : isEdit ? (
                            "Save Changes"
                        ) : (
                            "Create Product"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

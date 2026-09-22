"use client";

import { useMemo, useState, useCallback } from "react";
import { Package, Plus, DollarSign, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import { StatCard } from "@/components/StatCard";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { CategoriesManagerDialog } from "@/features/categories/components/CategoriesManagerDialog";

import { createProductColumns } from "./columns";
import { ProductDialog } from "./ProductDialog";
import { deleteProduct } from "@/features/products/actions/catalogActions";
import { toast } from "sonner";
import type { Product } from "@/types";

interface Props {
    data: Product[];
}

export function ProductsPageClient({ data }: Props) {
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );

    // Delete state
    const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(
        null,
    );

    // Statistics calculation
    const stats = useMemo(() => {
        const totalProducts = data.length;
        const prices = data.map((p) =>
            Number(p.price ?? p.variants?.[0]?.price ?? 0),
        );
        const avgPrice =
            totalProducts > 0
                ? prices.reduce((a, b) => a + b, 0) / totalProducts
                : 0;
        const maxPrice = totalProducts > 0 ? Math.max(...prices) : 0;

        const categoriesSet = new Set<string>();
        data.forEach((p) => {
            p.category?.forEach((c) => categoriesSet.add(c));
        });

        return {
            totalProducts,
            avgPrice,
            maxPrice,
            totalCategories: categoriesSet.size,
        };
    }, [data]);

    // Handlers
    const handleEdit = useCallback((product: Product) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((product: Product) => {
        setDeleteProductItem(product);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteProductItem) return { success: false };
        const res = await deleteProduct(deleteProductItem.id);
        if (res.success) {
            toast.success(
                `Deleted product "${deleteProductItem.name || deleteProductItem.title}"`,
            );
            return { success: true };
        } else {
            toast.error(res.error || "Failed to delete product");
            return { success: false, message: res.error };
        }
    }, [deleteProductItem]);

    const columns = useMemo(
        () => createProductColumns(handleEdit, handleDeleteClick),
        [handleEdit, handleDeleteClick],
    );

    return (
        <div className="space-y-6">
            {/* ── 1st: Header Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="group relative inline-flex shrink-0 overflow-hidden rounded-lg bg-blue-50 p-2 text-blue-600 shadow transition-all hover:scale-105">
                        <Package className="relative z-10 h-8 w-8" />
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                            Products Management
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Create, view, update, or remove products in Catalog
                            Service.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Categories Manager Button */}
                    <CategoriesManagerDialog />

                    {/* Add Product Button */}
                    <Button
                        onClick={() => {
                            setSelectedProduct(null);
                            setDialogOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg gap-1.5"
                    >
                        <Plus className="mr-1 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            {/* ── 2nd: StatCards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Products"
                    value={stats.totalProducts}
                    color="navy"
                    icon={<Package className="h-4 w-4 text-white" />}
                />
                <StatCard
                    label="Average Price"
                    value={`$${stats.avgPrice.toFixed(2)}`}
                    color="green"
                    icon={<DollarSign className="h-4 w-4 text-white" />}
                />
                <StatCard
                    label="Max Price"
                    value={`$${stats.maxPrice.toFixed(2)}`}
                    color="amber"
                    icon={<TrendingUp className="h-4 w-4 text-white" />}
                />
                <StatCard
                    label="Categories"
                    value={stats.totalCategories}
                    color="purple"
                    icon={<Tag className="h-4 w-4 text-white" />}
                />
            </div>

            {/* ── 3rd: Data Table Area ── */}
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                <DataTable
                    columns={columns}
                    data={data}
                    enableSearch
                    searchPlaceholder="Search products..."
                    clientPagination
                    initialPageSize={20}
                    emptyMessage="No products found."
                />
            </div>

            {/* Product Create / Edit Dialog */}
            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={selectedProduct}
                onSuccess={() => {
                    setDialogOpen(false);
                    setSelectedProduct(null);
                }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deleteProductItem}
                onClose={() => setDeleteProductItem(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa sản phẩm"
                description="Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi Catalog Service."
                itemName={deleteProductItem?.name || deleteProductItem?.title}
                itemDetail={`ID: ${deleteProductItem?.id} | Price: $${deleteProductItem?.price}`}
                confirmText="Xóa sản phẩm"
            />
        </div>
    );
}

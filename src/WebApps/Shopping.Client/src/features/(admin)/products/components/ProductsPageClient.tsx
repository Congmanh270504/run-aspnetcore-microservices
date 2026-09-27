"use client";

import { useMemo, useState, useCallback } from "react";
import {
    Package,
    Plus,
    DollarSign,
    Tag,
    TrendingUp,
    Filter,
    FolderTree,
    Layers,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import {
    GroupedAccordionTable,
    type GroupedSection,
} from "@/components/table/GroupedAccordionTable";
import { StatCard } from "@/components/StatCard";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createProductColumns } from "./columns";
import { ProductDialog } from "./ProductDialog";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { toast } from "sonner";
import type { Product } from "@/types";
import { CategoriesManagerDialog } from "../../categories/components/CategoriesManagerDialog";
import { deleteProduct } from "../actions/catalogActions";

interface Props {
    data: Product[];
}

export function ProductsPageClient({ data }: Props) {
    // Edit / Create Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );

    // View Details Dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [viewProductItem, setViewProductItem] = useState<Product | null>(
        null,
    );

    // Delete state
    const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(
        null,
    );

    // Grouping & Filtering state
    const [groupBy, setGroupBy] = useState<"none" | "type" | "category">(
        "none",
    );
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Extract all unique product types
    const allTypes = useMemo(() => {
        const set = new Set<string>();
        data.forEach((p) => {
            const typeName =
                typeof p.product_type === "string"
                    ? p.product_type
                    : (p.product_type?.name ??
                      (typeof p.productType === "string"
                          ? p.productType
                          : p.productType?.name));
            if (typeName) set.add(typeName);
        });
        return Array.from(set);
    }, [data]);

    // Extract all unique categories
    const allCategories = useMemo(() => {
        const set = new Set<string>();
        data.forEach((p) => {
            p.category?.forEach((c) => set.add(c));
        });
        return Array.from(set);
    }, [data]);

    // Filter data based on selectedType and selectedCategories
    const filteredData = useMemo(() => {
        return data.filter((p) => {
            if (selectedType !== "all") {
                const typeName =
                    typeof p.product_type === "string"
                        ? p.product_type
                        : (p.product_type?.name ??
                          (typeof p.productType === "string"
                              ? p.productType
                              : p.productType?.name));
                if (typeName !== selectedType) return false;
            }

            if (selectedCategories.length > 0) {
                const pCats = p.category || [];
                const hasMatch = selectedCategories.some((c) =>
                    pCats.includes(c),
                );
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [data, selectedType, selectedCategories]);

    // Group filteredData into GroupedSections when groupBy !== "none"
    const groupedSections = useMemo((): GroupedSection<Product>[] => {
        if (groupBy === "none") return [];

        if (groupBy === "type") {
            const map = new Map<string, Product[]>();
            filteredData.forEach((p) => {
                const typeName =
                    typeof p.product_type === "string"
                        ? p.product_type
                        : (p.product_type?.name ??
                          (typeof p.productType === "string"
                              ? p.productType
                              : p.productType?.name) ??
                          "Chưa phân loại");
                if (!map.has(typeName)) map.set(typeName, []);
                map.get(typeName)!.push(p);
            });

            return Array.from(map.entries()).map(([typeName, items]) => ({
                key: typeName,
                label: `${typeName}`,
                items,
            }));
        }

        if (groupBy === "category") {
            const map = new Map<string, Product[]>();
            filteredData.forEach((p) => {
                const cats =
                    p.category && p.category.length > 0
                        ? p.category
                        : ["Chưa có danh mục"];
                cats.forEach((cat) => {
                    if (!map.has(cat)) map.set(cat, []);
                    map.get(cat)!.push(p);
                });
            });

            return Array.from(map.entries()).map(([cat, items]) => ({
                key: cat,
                label: `Danh mục: ${cat}`,
                items,
            }));
        }

        return [];
    }, [filteredData, groupBy]);

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
    const handleView = useCallback((product: Product) => {
        setViewProductItem(product);
        setDetailDialogOpen(true);
    }, []);

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
        () => createProductColumns(handleView, handleEdit, handleDeleteClick),
        [handleView, handleEdit, handleDeleteClick],
    );

    // Toolbar actions for DataTable
    const tableActions = useMemo(() => {
        return [
            // 1. Group By Select
            <div key="group-by-select" className="flex items-center gap-1.5">
                <Select
                    value={groupBy}
                    onValueChange={(val: "none" | "type" | "category") =>
                        setGroupBy(val)
                    }
                >
                    <SelectTrigger className="h-9 w-37.5 text-xs">
                        <FolderTree className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="none">No group</SelectItem>
                        <SelectItem value="type">Product type</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                </Select>
            </div>,

            // 2. Product Type Filter Select
            <div key="type-select" className="flex items-center gap-1.5">
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-9 w-40 text-xs">
                        <Layers className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">
                            All types ({data.length})
                        </SelectItem>
                        {allTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>,

            // 3. Categories Multi-Select DropdownMenu
            <DropdownMenu key="category-dropdown">
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5 border-dashed"
                    >
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Categores</span>
                        {selectedCategories.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-0.5 rounded-xs px-1 py-0 text-[10px] font-semibold"
                            >
                                {selectedCategories.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 max-h-64 overflow-y-auto"
                >
                    <DropdownMenuLabel className="text-xs">
                        Filter by category
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allCategories.map((cat) => (
                        <DropdownMenuCheckboxItem
                            key={cat}
                            checked={selectedCategories.includes(cat)}
                            onCheckedChange={(checked) => {
                                setSelectedCategories((prev) =>
                                    checked
                                        ? [...prev, cat]
                                        : prev.filter((c) => c !== cat),
                                );
                            }}
                            className="text-xs"
                        >
                            {cat}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {selectedCategories.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setSelectedCategories([])}
                                className="justify-center text-center text-xs text-red-600 focus:text-red-600 cursor-pointer font-medium"
                            >
                                Xóa chọn danh mục ({selectedCategories.length})
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>,

            // Clear active filters button
            (selectedType !== "all" || selectedCategories.length > 0) && (
                <Button
                    key="reset-filters"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedType("all");
                        setSelectedCategories([]);
                    }}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Xóa tất cả bộ lọc"
                >
                    <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
            ),
        ].filter(Boolean);
    }, [
        groupBy,
        selectedType,
        selectedCategories,
        allTypes,
        allCategories,
        data.length,
    ]);

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
            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden p-3 space-y-2">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    onRowClick={handleView}
                    enableSearch
                    searchPlaceholder="Search products..."
                    clientPagination={groupBy === "none"}
                    initialPageSize={20}
                    emptyMessage="No products found."
                    hideDataArea={groupBy !== "none"}
                    actions={tableActions}
                />

                {groupBy !== "none" && (
                    <GroupedAccordionTable
                        columns={columns}
                        groups={groupedSections}
                        onRowClick={handleView}
                        emptyMessage="Không tìm thấy sản phẩm nào."
                    />
                )}
            </div>

            {/* Product Detail Dialog */}
            <ProductDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                product={viewProductItem}
                onEdit={(product) => handleEdit(product)}
            />

            {/* Product Create / Edit Dialog */}
            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={selectedProduct}
                categoriesList={Array.from(
                    new Set(data.flatMap((p) => p.category || [])),
                )}
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

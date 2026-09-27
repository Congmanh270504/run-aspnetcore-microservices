"use client";

import { useMemo, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { createColumns } from "./columns";
import { DiscountDialog } from "./DiscountDialog";
import { deleteDiscount } from "../actions/discountActions";
import { toast } from "sonner";
import type { Coupon, Product } from "@/types";

interface Props {
    data: Coupon[];
    products?: Product[];
}

export function DiscountPageClient({ data, products = [] }: Props) {
    const [editItem, setEditItem] = useState<Coupon | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [deleteItem, setDeleteItem] = useState<Coupon | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const columns = useMemo(
        () =>
            createColumns(
                (row) => {
                    setEditItem(row);
                    setDialogOpen(true);
                },
                (row) => {
                    setDeleteItem(row);
                    setDeleteDialogOpen(true);
                }
            ),
        []
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 shadow-sm border border-emerald-100">
                        <Ticket className="h-7 w-7" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            Discounts Management
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage product coupons and discount amounts for customers.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => {
                        setEditItem(null);
                        setDialogOpen(true);
                    }}
                    className="gap-2 font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="h-4 w-4" /> Add New Coupon
                </Button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    enableSearch
                    searchPlaceholder="Search product name..."
                    clientPagination
                />
            </div>

            {/* Edit / Create Dialog */}
            <DiscountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                item={editItem}
                products={products}
                onSuccess={() => {
                    setDialogOpen(false);
                    setEditItem(null);
                }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setDeleteItem(null);
                }}
                title="Xác nhận xóa mã giảm giá"
                description="Hành động này sẽ xóa mã giảm giá của sản phẩm khỏi hệ thống."
                itemName={deleteItem?.productName}
                itemDetail={deleteItem ? `Số tiền giảm: -$${deleteItem.amount}` : undefined}
                confirmText="Xóa Coupon"
                onConfirm={async () => {
                    if (!deleteItem) return { success: false };
                    const result = await deleteDiscount(deleteItem.id, deleteItem.productName);
                    if (result.success) {
                        toast.success("Coupon deleted successfully!");
                        return { success: true };
                    } else {
                        toast.error(result.error || "Failed to delete coupon");
                        return { success: false, message: result.error };
                    }
                }}
            />
        </div>
    );
}


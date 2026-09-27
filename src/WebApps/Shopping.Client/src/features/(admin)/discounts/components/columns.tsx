"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Coupon } from "@/types";

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "—";
        return format(d, "dd/MM/yyyy HH:mm");
    } catch {
        return "—";
    }
}

function getStatusBadge(startDateStr?: string | null, endDateStr?: string | null) {
    if (!startDateStr || !endDateStr) {
        return (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold px-2.5 py-0.5">
                Đang hiệu lực
            </Badge>
        );
    }
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (!isNaN(start.getTime()) && now < start) {
        return (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold px-2.5 py-0.5">
                Sắp hiệu lực
            </Badge>
        );
    } else if (!isNaN(end.getTime()) && now > end) {
        return (
            <Badge className="bg-slate-100 text-slate-600 border-slate-300 font-semibold px-2.5 py-0.5">
                Hết hạn
            </Badge>
        );
    } else {
        return (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold px-2.5 py-0.5">
                Đang hiệu lực
            </Badge>
        );
    }
}

export function createColumns(
    onEdit: (row: Coupon) => void,
    onDelete: (row: Coupon) => void,
): ColumnDef<Coupon>[] {
    return [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>,
        },
        {
            accessorKey: "productName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="p-0 hover:bg-transparent font-bold"
                >
                    Product Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium text-slate-900">{row.original.productName}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="text-sm text-slate-600 max-w-md truncate">
                    {row.original.description || "—"}
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="p-0 hover:bg-transparent font-bold"
                >
                    Discount Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold px-2.5 py-0.5">
                    -${row.original.amount.toLocaleString("en-US")}
                </Badge>
            ),
        },
        {
            accessorKey: "startDate",
            header: "Ngày bắt đầu",
            cell: ({ row }) => (
                <span className="text-xs text-slate-600 font-mono">
                    {formatDate(row.original.startDate)}
                </span>
            ),
        },
        {
            accessorKey: "endDate",
            header: "Ngày kết thúc",
            cell: ({ row }) => (
                <span className="text-xs text-slate-600 font-mono">
                    {formatDate(row.original.endDate)}
                </span>
            ),
        },
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.original.startDate, row.original.endDate),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.original)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit Coupon"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(row.original)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Coupon"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];
}


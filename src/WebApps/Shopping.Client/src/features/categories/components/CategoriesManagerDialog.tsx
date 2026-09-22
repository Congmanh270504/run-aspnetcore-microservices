"use client";

import { useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { CategoriesEditedTable } from "@/features/categories/components/CategoriesEditedTable";
import { getCategoryRows } from "@/features/categories/actions/categoryActions";
import type { CategoryRow } from "@/features/categories/actions/categoryActions";

export function CategoriesManagerDialog() {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<CategoryRow[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        try {
            const rows = await getCategoryRows();
            setData(rows);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── Trigger button ── */}
            <Button
                variant="outline"
                size="sm"
                className="gap-2 font-semibold shadow-sm border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={handleOpen}
            >
                <Layers className="h-4 w-4" />
                Manage Categories
            </Button>

            {/* ── Dialog ── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:!max-w-xl max-h-[85vh] flex flex-col p-0 rounded-xl gap-0 overflow-hidden border shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 rounded-t-lg shrink-0">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Layers className="h-6 w-6" />
                            Category Manager
                        </DialogTitle>
                        <DialogDescription className="text-white/85 text-sm mt-1">
                            Rename or delete product categories. Changes
                            propagate to all linked products.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">
                                    Loading categories…
                                </span>
                            </div>
                        ) : (
                            <CategoriesEditedTable initialData={data} />
                        )}
                    </div>

                    <DialogFooter className="px-4 py-3 border-t shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

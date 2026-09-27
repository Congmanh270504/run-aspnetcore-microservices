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
import type { CategoryRow, ProductTypeRow } from "../actions/categoryActions";
import {
    getCategoryRows,
    getProductTypeRows,
} from "../actions/categoryActions";
import { CategoriesEditedTable } from "./CategoriesEditedTable";

export function CategoriesManagerDialog() {
    const [open, setOpen] = useState(false);
    const [categoriesData, setCategoriesData] = useState<CategoryRow[]>([]);
    const [productTypesData, setProductTypesData] = useState<ProductTypeRow[]>(
        [],
    );
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        try {
            const [catRows, ptRows] = await Promise.all([
                getCategoryRows(),
                getProductTypeRows(),
            ]);
            setCategoriesData(catRows);
            setProductTypesData(ptRows);
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
                Manage Categories & Types
            </Button>

            {/* ── Dialog ── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:!max-w-xl max-h-[85vh] flex flex-col p-0 rounded-xl gap-0 overflow-hidden border shadow-2xl">
                    <DialogHeader className="px-6 pt-5 pb-4 bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                                <Layers className="h-5 w-5" />
                            </span>
                            <div>
                                <DialogTitle className="text-lg font-bold text-gray-900">
                                    Categories & Product Types Manager
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                                    Rename or delete product types & categories.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">
                                    Loading categories & product types…
                                </span>
                            </div>
                        ) : (
                            <CategoriesEditedTable
                                initialCategories={categoriesData}
                                initialProductTypes={productTypesData}
                            />
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

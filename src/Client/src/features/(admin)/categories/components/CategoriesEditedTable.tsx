"use client";

import React from "react";
import { toast } from "sonner";
import {
    Pencil,
    Trash2,
    Check,
    X,
    Plus,
    Loader2,
    Package,
    Tag,
    RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { CategoryRow, ProductTypeRow } from "../actions/categoryActions";

import {
    getProductTypeRows,
    createProductType,
    renameCategory,
    createCategory,
    deleteCategory,
    getCategoryRows,
    renameProductType,
    deleteProductType,
} from "../actions/categoryActions";

interface Props {
    initialData?: CategoryRow[];
    initialCategories?: CategoryRow[];
    initialProductTypes?: ProductTypeRow[];
}

export function CategoriesEditedTable({
    initialData = [],
    initialCategories = initialData,
    initialProductTypes = [],
}: Props) {
    return (
        <Tabs defaultValue="product_type" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger
                    value="product_type"
                    className="flex items-center gap-2 font-semibold"
                >
                    <Package className="h-4 w-4 text-purple-600" />
                    Product Types
                </TabsTrigger>
                <TabsTrigger
                    value="categories"
                    className="flex items-center gap-2 font-semibold"
                >
                    <Tag className="h-4 w-4 text-pink-600" />
                    Categories
                </TabsTrigger>
            </TabsList>
            <TabsContent value="product_type">
                <ProductTypeTableView initialData={initialProductTypes} />
            </TabsContent>
            <TabsContent value="categories">
                <CategoryTableView initialData={initialCategories} />
            </TabsContent>
        </Tabs>
    );
}

// ─── Inline Editable Cell Input ───────────────────────────────────────────────

interface InlineCellInputProps {
    defaultValue: string;
    onSave: (val: string) => void;
    onCancel: () => void;
    onChangeValue?: (val: string) => void;
    placeholder?: string;
    className?: string;
}

function InlineCellInput({
    defaultValue,
    onSave,
    onCancel,
    onChangeValue,
    placeholder,
    className = "h-8 text-sm",
}: InlineCellInputProps) {
    const [val, setVal] = React.useState(defaultValue);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const el = inputRef.current;
        if (el) {
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setVal(next);
        onChangeValue?.(next);
    };

    return (
        <Input
            ref={inputRef}
            value={val}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            onKeyDown={(e) => {
                if (e.key === "Enter") onSave(val);
                if (e.key === "Escape") onCancel();
            }}
        />
    );
}

// ─── Product Type Table Component ──────────────────────────────────────────────

interface RowItem {
    name: string;
    productCount: number;
    _isNew?: boolean;
}

function ProductTypeTableView({
    initialData,
}: {
    initialData: ProductTypeRow[];
}) {
    const [list, setList] = React.useState<ProductTypeRow[]>(initialData);
    const [loading, setLoading] = React.useState(false);
    const [addingRow, setAddingRow] = React.useState(false);
    const [editingName, setEditingName] = React.useState<string | null>(null);

    const editingValueRef = React.useRef("");
    const newNameRef = React.useRef("");

    React.useEffect(() => {
        if (initialData && initialData.length > 0) setList(initialData);
        else {
            getProductTypeRows().then((rows) => setList(rows));
        }
    }, []);

    const startEdit = React.useCallback((name: string) => {
        editingValueRef.current = name;
        setEditingName(name);
        setAddingRow(false);
    }, []);

    const cancelEdit = React.useCallback(() => {
        editingValueRef.current = "";
        setEditingName(null);
    }, []);

    const startAdd = React.useCallback(() => {
        newNameRef.current = "";
        setAddingRow(true);
        setEditingName(null);
    }, []);

    const cancelAdd = React.useCallback(() => {
        newNameRef.current = "";
        setAddingRow(false);
    }, []);

    const handleRename = React.useCallback(
        async (oldName: string, directValue?: string) => {
            const valToUse = directValue ?? editingValueRef.current;
            const trimmed = valToUse.trim();
            if (!trimmed) {
                toast.error("Product type name cannot be empty");
                return;
            }
            if (trimmed === oldName) {
                cancelEdit();
                return;
            }
            setLoading(true);
            const result = await renameProductType(oldName, trimmed);
            setLoading(false);
            if (result.success) {
                setList((prev) =>
                    prev.map((r) =>
                        r.name === oldName ? { ...r, name: trimmed } : r,
                    ),
                );
                toast.success(
                    `Renamed Product Type "${oldName}" → "${trimmed}"`,
                );
                cancelEdit();
            } else {
                toast.error(result.error ?? "Rename failed");
            }
        },
        [cancelEdit],
    );

    const handleAddNew = React.useCallback(
        async (directValue?: string) => {
            const valToUse = directValue ?? newNameRef.current;
            const trimmed = valToUse.trim();
            if (!trimmed) {
                toast.error("Product type name cannot be empty");
                return;
            }
            if (
                list.some(
                    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
                )
            ) {
                toast.error("Product type already exists");
                return;
            }
            setLoading(true);
            const result = await createProductType(trimmed);
            setLoading(false);
            if (result.success) {
                setList((prev) => [{ name: trimmed, productCount: 0 }, ...prev]);
                toast.success(`Created Product Type "${trimmed}"`);
                cancelAdd();
            } else {
                toast.error(result.error ?? "Failed to create product type");
            }
        },
        [list, cancelAdd],
    );

    const handleDelete = React.useCallback(async (name: string) => {
        setLoading(true);
        const result = await deleteProductType(name);
        setLoading(false);
        if (result.success) {
            setList((prev) => prev.filter((r) => r.name !== name));
            toast.success(`Deleted Product Type "${name}"`);
        } else {
            toast.error(result.error ?? "Delete failed");
        }
    }, []);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        const fresh = await getProductTypeRows();
        setList(fresh);
        setLoading(false);
    }, []);

    const tableData = React.useMemo<RowItem[]>(() => {
        const rows: RowItem[] = editingName
            ? list.map((r) => (r.name === editingName ? { ...r } : r))
            : [...list];
        if (addingRow) {
            return [
                { name: "__new__", productCount: 0, _isNew: true },
                ...rows,
            ];
        }
        return rows;
    }, [addingRow, editingName, list]);

    const columns = React.useMemo<ColumnDef<RowItem>[]>(
        () => [
            {
                accessorKey: "name",
                header: () => (
                    <div className="text-xs font-semibold">Product Type</div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew) {
                        return (
                            <InlineCellInput
                                defaultValue=""
                                onChangeValue={(val) => {
                                    newNameRef.current = val;
                                }}
                                onSave={(val) => handleAddNew(val)}
                                onCancel={cancelAdd}
                                placeholder="New Product Type name…"
                            />
                        );
                    }
                    if (editingName === item.name) {
                        return (
                            <InlineCellInput
                                defaultValue={item.name}
                                onChangeValue={(val) => {
                                    editingValueRef.current = val;
                                }}
                                onSave={(val) => handleRename(item.name, val)}
                                onCancel={cancelEdit}
                            />
                        );
                    }
                    return (
                        <span className="font-medium text-slate-800 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                            {item.name}
                        </span>
                    );
                },
            },
            {
                accessorKey: "productCount",
                header: () => (
                    <div className="text-center text-xs font-semibold">
                        Products
                    </div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew || editingName === item.name) return null;
                    return (
                        <div className="text-center">
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                                {item.productCount}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={refresh}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <RotateCcw />
                            )}
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={startAdd}
                            disabled={addingRow}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew) {
                        return (
                            <div className="flex items-center justify-center gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() => handleAddNew()}
                                    disabled={loading}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={cancelAdd}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    }
                    if (editingName === item.name) {
                        return (
                            <div className="flex items-center justify-center gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() => handleRename(item.name)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Check className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={cancelEdit}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    }
                    return (
                        <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => startEdit(item.name)}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                title="Rename"
                            >
                                <Pencil className="h-4 w-4 text-yellow-600" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.name)}
                                disabled={loading}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                        </div>
                    );
                },
            },
        ],
        [
            addingRow,
            cancelAdd,
            cancelEdit,
            editingName,
            handleAddNew,
            handleDelete,
            handleRename,
            loading,
            refresh,
            startAdd,
            startEdit,
        ],
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-card border border-border rounded-xl">
                <DataTable
                    columns={columns}
                    data={tableData}
                    enableSearch={false}
                    hideToolbar
                    emptyMessage="No product types yet"
                    clientPagination
                    initialPageSize={20}
                />
            </div>
            {item_count_note(list, "product type")}
        </div>
    );
}

// ─── Category Table Component ──────────────────────────────────────────────────

function CategoryTableView({ initialData }: { initialData: CategoryRow[] }) {
    const [list, setList] = React.useState<CategoryRow[]>(initialData);
    const [loading, setLoading] = React.useState(false);
    const [addingRow, setAddingRow] = React.useState(false);
    const [editingName, setEditingName] = React.useState<string | null>(null);

    const editingValueRef = React.useRef("");
    const newNameRef = React.useRef("");

    React.useEffect(() => {
        if (initialData && initialData.length > 0) setList(initialData);
        else {
            getCategoryRows().then((rows) => setList(rows));
        }
    }, []);

    const startEdit = React.useCallback((name: string) => {
        editingValueRef.current = name;
        setEditingName(name);
        setAddingRow(false);
    }, []);

    const cancelEdit = React.useCallback(() => {
        editingValueRef.current = "";
        setEditingName(null);
    }, []);

    const startAdd = React.useCallback(() => {
        newNameRef.current = "";
        setAddingRow(true);
        setEditingName(null);
    }, []);

    const cancelAdd = React.useCallback(() => {
        newNameRef.current = "";
        setAddingRow(false);
    }, []);

    const handleRename = React.useCallback(
        async (oldName: string, directValue?: string) => {
            const valToUse = directValue ?? editingValueRef.current;
            const trimmed = valToUse.trim();
            if (!trimmed) {
                toast.error("Category name cannot be empty");
                return;
            }
            if (trimmed === oldName) {
                cancelEdit();
                return;
            }
            setLoading(true);
            const result = await renameCategory(oldName, trimmed);
            setLoading(false);
            if (result.success) {
                setList((prev) =>
                    prev.map((r) =>
                        r.name === oldName ? { ...r, name: trimmed } : r,
                    ),
                );
                toast.success(`Renamed "${oldName}" → "${trimmed}"`);
                cancelEdit();
            } else {
                toast.error(result.error ?? "Rename failed");
            }
        },
        [cancelEdit],
    );

    const handleAddNew = React.useCallback(
        async (directValue?: string) => {
            const valToUse = directValue ?? newNameRef.current;
            const trimmed = valToUse.trim();
            if (!trimmed) {
                toast.error("Category name cannot be empty");
                return;
            }
            if (
                list.some(
                    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
                )
            ) {
                toast.error("Category already exists");
                return;
            }
            setLoading(true);
            const result = await createCategory(trimmed);
            setLoading(false);
            if (result.success) {
                setList((prev) => [{ name: trimmed, productCount: 0 }, ...prev]);
                toast.success(`Created Category "${trimmed}"`);
                cancelAdd();
            } else {
                toast.error(result.error ?? "Failed to create category");
            }
        },
        [list, cancelAdd],
    );

    const handleDelete = React.useCallback(async (name: string) => {
        setLoading(true);
        const result = await deleteCategory(name);
        setLoading(false);
        if (result.success) {
            setList((prev) => prev.filter((r) => r.name !== name));
            toast.success(`Deleted "${name}"`);
        } else {
            toast.error(result.error ?? "Delete failed");
        }
    }, []);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        const fresh = await getCategoryRows();
        setList(fresh);
        setLoading(false);
    }, []);

    const tableData = React.useMemo<RowItem[]>(() => {
        const rows: RowItem[] = editingName
            ? list.map((r) => (r.name === editingName ? { ...r } : r))
            : [...list];
        if (addingRow) {
            return [
                { name: "__new__", productCount: 0, _isNew: true },
                ...rows,
            ];
        }
        return rows;
    }, [addingRow, editingName, list]);

    const columns = React.useMemo<ColumnDef<RowItem>[]>(
        () => [
            {
                accessorKey: "name",
                header: () => (
                    <div className="text-xs font-semibold">Category name</div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew) {
                        return (
                            <InlineCellInput
                                defaultValue=""
                                onChangeValue={(val) => {
                                    newNameRef.current = val;
                                }}
                                onSave={(val) => handleAddNew(val)}
                                onCancel={cancelAdd}
                                placeholder="New category name…"
                            />
                        );
                    }
                    if (editingName === item.name) {
                        return (
                            <InlineCellInput
                                defaultValue={item.name}
                                onChangeValue={(val) => {
                                    editingValueRef.current = val;
                                }}
                                onSave={(val) => handleRename(item.name, val)}
                                onCancel={cancelEdit}
                            />
                        );
                    }
                    return (
                        <span className="font-medium text-slate-800 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
                            {item.name}
                        </span>
                    );
                },
            },
            {
                accessorKey: "productCount",
                header: () => (
                    <div className="text-center text-xs font-semibold">
                        Products
                    </div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew || editingName === item.name) return null;
                    return (
                        <div className="text-center">
                            <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                                {item.productCount}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            className="h-7 gap-1.5 text-xs bg-pink-600 hover:bg-pink-700 text-white"
                            onClick={startAdd}
                            disabled={addingRow}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1.5 text-xs"
                            onClick={refresh}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <RotateCcw />
                            )}
                        </Button>
                    </div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    if (item._isNew) {
                        return (
                            <div className="flex items-center justify-center gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() => handleAddNew()}
                                    disabled={loading}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={cancelAdd}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    }
                    if (editingName === item.name) {
                        return (
                            <div className="flex items-center justify-center gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() => handleRename(item.name)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Check className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={cancelEdit}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    }
                    return (
                        <div className="flex items-center justify-center gap-1">
                            <button
                                onClick={() => startEdit(item.name)}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                title="Rename"
                            >
                                <Pencil className="h-4 w-4 text-yellow-600" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.name)}
                                disabled={loading}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                        </div>
                    );
                },
            },
        ],
        [
            addingRow,
            cancelAdd,
            cancelEdit,
            editingName,
            handleAddNew,
            handleDelete,
            handleRename,
            loading,
            refresh,
            startAdd,
            startEdit,
        ],
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-card border border-border rounded-xl">
                <DataTable
                    columns={columns}
                    data={tableData}
                    enableSearch={false}
                    hideToolbar
                    emptyMessage="No categories yet"
                    clientPagination
                    initialPageSize={20}
                />
            </div>
            {item_count_note(list, "category")}
        </div>
    );
}

function item_count_note(list: RowItem[], label: string) {
    const withProducts = list.filter((r) => r.productCount > 0).length;
    const empty = list.length - withProducts;
    if (empty === 0) return null;
    return (
        <p className="text-[11px] text-muted-foreground">
            ⚠ {empty} {label} {empty === 1 ? "has" : "have"} 0 products —
            won&apos;t be persisted until assigned.
        </p>
    );
}

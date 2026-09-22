import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/actions/catalogActions";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChevronRight } from "lucide-react";

export const revalidate = 0;

interface Props {
    params: {
        id: string;
    };
}

export const metadata = {
    title: "Edit Product - Admin Portal",
};

export default async function EditProductPage({ params }: Props) {
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/admin" className="hover:text-foreground">
                    Admin
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/admin/products" className="hover:text-foreground">
                    Products
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-semibold">
                    Edit Product
                </span>
            </nav>

            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Edit Product
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Update product information, pricing, and categories.
                </p>
            </div>

            <ProductForm initialProduct={product} />
        </div>
    );
}

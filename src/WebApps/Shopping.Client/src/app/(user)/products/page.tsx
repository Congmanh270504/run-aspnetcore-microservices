import React from "react";
import Link from "next/link";
import {
    getProducts,
    getAllCategories,
    getProductsByCategory,
} from "@/features/products/actions/catalogActions";
import { ProductCard } from "@/components/product/ProductCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ChevronRight, Filter } from "lucide-react";

export const revalidate = 0;

interface Props {
    searchParams?: {
        category?: string;
        search?: string;
    };
}

export default async function ProductsPage({ searchParams }: Props) {
    const selectedCategory = searchParams?.category;
    const searchQuery = searchParams?.search?.toLowerCase();

    const [allCategories, initialProducts] = await Promise.all([
        getAllCategories(),
        selectedCategory
            ? getProductsByCategory(selectedCategory)
            : getProducts(1, 50),
    ]);

    const filteredProducts = searchQuery
        ? initialProducts.filter(
              (p) =>
                  p.name.toLowerCase().includes(searchQuery) ||
                  p.description.toLowerCase().includes(searchQuery),
          )
        : initialProducts;

    const lastProduct = initialProducts[initialProducts.length - 1];

    return (
        <div className="container py-8 space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link
                    href="/products"
                    className={
                        !selectedCategory
                            ? "text-foreground font-medium"
                            : "hover:text-foreground"
                    }
                >
                    Products
                </Link>
                {selectedCategory && (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-semibold">
                            {selectedCategory}
                        </span>
                    </>
                )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="p-4 bg-muted/40 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" />{" "}
                                Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            <Link
                                href="/products"
                                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                    !selectedCategory
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                            >
                                All Categories
                            </Link>
                            {allCategories.map((cat) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <Link
                                        key={cat}
                                        href={`/products?category=${encodeURIComponent(cat)}`}
                                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                    >
                                        {cat}
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Featured Sidebar Product */}
                    {lastProduct && (
                        <Card className="border shadow-sm overflow-hidden hidden sm:block">
                            <CardHeader className="p-3 bg-emerald-600 text-white">
                                <span className="text-xs font-bold uppercase">
                                    Featured Item
                                </span>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="h-32 bg-slate-50 flex items-center justify-center p-2 rounded">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={
                                            lastProduct.imageFile
                                                ? `/images/product/${lastProduct.imageFile}`
                                                : "/images/placeholder.png"
                                        }
                                        alt={lastProduct.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <h4 className="font-semibold text-sm line-clamp-1">
                                    {lastProduct.name}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {lastProduct.description}
                                </p>
                                <div className="font-bold text-emerald-600 text-base">
                                    ${Number(lastProduct.price).toFixed(2)}
                                </div>
                                <Link
                                    href={`/products/${lastProduct.id}`}
                                    className="block"
                                >
                                    <span className="text-xs text-primary font-medium hover:underline">
                                        View details →
                                    </span>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {selectedCategory
                                    ? `${selectedCategory}`
                                    : "All Products"}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">
                                Showing {filteredProducts.length} items
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                        </div>
                        {selectedCategory && (
                            <Link href="/products">
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer gap-1 hover:bg-accent"
                                >
                                    Clear filter ✕
                                </Badge>
                            </Link>
                        )}
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border rounded-xl bg-card space-y-3">
                            <Filter className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                            <h3 className="font-semibold text-base">
                                No products found
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Try selecting another category or clear your
                                search filter.
                            </p>
                            <Link href="/products">
                                <button className="text-xs font-semibold text-primary hover:underline">
                                    View all products
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

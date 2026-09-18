import React from "react";
import Link from "next/link";
import { getProducts } from "@/actions/catalogActions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Package } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const revalidate = 0;

export const metadata = {
  title: "Manage Products - Admin Portal",
};

export default async function AdminProductsPage() {
  const products = await getProducts(1, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Products Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, view, update, or remove products in CatalogDb.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="gap-2 font-semibold shadow-sm bg-primary">
            <PlusCircle className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 bg-muted/20 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            All Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/80">
                  <TableCell>
                    <div className="h-12 w-12 rounded bg-slate-100 p-1 flex items-center justify-center border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageFile ? `/images/product/${product.imageFile}` : "/images/placeholder.png"}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-sm text-slate-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.category?.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[10px]">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm text-emerald-600">
                    ${Number(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-700">
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


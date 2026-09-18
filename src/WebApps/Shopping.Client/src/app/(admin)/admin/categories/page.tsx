import React from "react";
import Link from "next/link";
import { getProducts, getAllCategories } from "@/actions/catalogActions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ExternalLink, PlusCircle } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "Categories - Admin Portal",
};

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getProducts(1, 100),
  ]);

  const categoryStats = categories.map((cat) => {
    const matchingProducts = products.filter((p) => p.category?.includes(cat));
    const avgPrice = matchingProducts.length > 0
      ? matchingProducts.reduce((sum, p) => sum + Number(p.price), 0) / matchingProducts.length
      : 0;

    return {
      name: cat,
      count: matchingProducts.length,
      avgPrice,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Categories Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Overview of product categories and catalog distribution.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="gap-2 font-semibold shadow-sm bg-primary">
            <PlusCircle className="h-4 w-4" /> Add Product with New Category
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 bg-muted/20 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Active Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-center">Total Products</TableHead>
                <TableHead className="text-right">Average Price</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryStats.map((item) => (
                <TableRow key={item.name} className="hover:bg-slate-50/80">
                  <TableCell className="font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-bold">
                      {item.count} items
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    ${item.avgPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/products?category=${encodeURIComponent(item.name)}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-700">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </Link>
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


import {
    getAllCategories,
    getProducts,
} from "@/features/products/actions/catalogActions";
import { getOrders } from "@/actions/orderActions";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowRight,
    DollarSign,
    Layers,
    Package,
    PlusCircle,
    ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboardPage() {
    const [products, categories, orders] = await Promise.all([
        getProducts(1, 100),
        getAllCategories(),
        getOrders(1, 100),
    ]);

    const totalCatalogValue = products.reduce(
        (sum, p) => sum + Number(p.price || 0),
        0,
    );
    const totalRevenue = orders.reduce((sum, o) => {
        const orderTotal =
            o.orderItems?.reduce((sub, i) => sub + i.price * i.quantity, 0) ||
            0;
        return sum + orderTotal;
    }, 0);

    const kpis = [
        {
            title: "Total Products",
            value: products.length,
            desc: "Items in CatalogDb",
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Active Categories",
            value: categories.length,
            desc: "Product classifications",
            icon: Layers,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "Total Orders",
            value: orders.length,
            desc: "Received in OrderDb",
            icon: ShoppingCart,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Total Revenue",
            value: `$${totalRevenue.toFixed(2)}`,
            desc: "Gross order sales",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    return (
        <div className="space-y-8 ">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Real-time overview of products, categories, and orders
                        across all microservices.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products/new">
                        <Button
                            size="sm"
                            className="gap-2 font-semibold shadow-sm bg-primary"
                        >
                            <PlusCircle className="h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 font-semibold"
                        >
                            <ShoppingCart className="h-4 w-4" /> View Orders
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 lg:px-6">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.title} className="shadow-sm border">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                                        {kpi.title}
                                    </p>
                                    <h3 className="text-2xl font-black mt-1 text-slate-900">
                                        {kpi.value}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {kpi.desc}
                                    </p>
                                </div>
                                <div
                                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                {/* Recent Products */}
                <Card className="shadow-sm">
                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" /> Recent
                            Products
                        </CardTitle>
                        <Link
                            href="/admin/products"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {products.slice(0, 5).map((p) => (
                            <div
                                key={p.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-slate-100 p-1 flex items-center justify-center border shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={
                                                p.imageFile
                                                    ? `/images/product/${p.imageFile}`
                                                    : "/images/placeholder.png"
                                            }
                                            alt={p.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="truncate">
                                        <p className="font-semibold text-sm text-slate-900 truncate">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {p.category?.[0] || "General"}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm text-emerald-600 shrink-0">
                                    ${Number(p.price).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="shadow-sm">
                    <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-amber-500" />{" "}
                            Recent Orders
                        </CardTitle>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {orders.length > 0 ? (
                            orders.slice(0, 5).map((o) => {
                                const total =
                                    o.orderItems?.reduce(
                                        (sum, i) => sum + i.price * i.quantity,
                                        0,
                                    ) || 0;
                                return (
                                    <div
                                        key={o.id || o.orderName}
                                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900">
                                                {o.shippingAddress?.firstName}{" "}
                                                {o.shippingAddress?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {o.orderName || "Online Order"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-emerald-600">
                                                ${total.toFixed(2)}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] mt-0.5"
                                            >
                                                {o.orderItems?.length || 0}{" "}
                                                items
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No orders placed yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
            </div>

            {/* <DataTable data={data} /> */}
        </div>
    );
}

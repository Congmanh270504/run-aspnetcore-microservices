import React from "react";
import Link from "next/link";
import { getOrders } from "@/actions/orderActions";
import { OrderStatus } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, ArrowRight, Clock } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "My Orders - EShop Microservices",
};

export default async function OrdersPage() {
  const orders = await getOrders(1, 20);

  const getStatusBadge = (status: OrderStatus | number) => {
    switch (status) {
      case OrderStatus.Completed:
      case 3:
        return <Badge variant="success">Completed</Badge>;
      case OrderStatus.Pending:
      case 2:
        return <Badge variant="warning">Pending</Badge>;
      case OrderStatus.Cancelled:
      case 4:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Order History</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track and view your recent orders processed by Ordering.API.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" size="sm" className="gap-2">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {orders && orders.length > 0 ? (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px]">Order Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Items Count</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const totalPrice = order.orderItems
                  ? order.orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
                  : 0;

                return (
                  <TableRow key={order.id || order.orderName}>
                    <TableCell className="font-bold text-sm text-primary">
                      {order.orderName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.shippingAddress?.emailAddress}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{order.shippingAddress?.addressLine}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.shippingAddress?.state}, {order.shippingAddress?.country}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-xs">{order.payment?.cardName}</div>
                      <div className="text-xs text-muted-foreground">
                        Card: {order.payment?.cardNumber ? `•••• ${order.payment.cardNumber.slice(-4)}` : "Credit Card"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {order.orderItems?.length || 0} items
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm text-emerald-600">
                      ${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-2xl bg-card space-y-4 max-w-md mx-auto my-8 p-8 shadow-sm">
          <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">No Orders Found</h2>
          <p className="text-sm text-muted-foreground">
            You have not placed any orders yet. Try adding some items to your cart and checkout!
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button className="gap-2">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}


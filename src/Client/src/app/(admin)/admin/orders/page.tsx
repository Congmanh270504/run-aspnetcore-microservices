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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, MapPin, CreditCard, Package } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "All Orders - Admin Portal",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders(1, 100);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Orders Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor incoming customer and admin purchases stored in OrderDb.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 bg-muted/20 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-amber-500" />
            All Received Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-[140px]">Order ID / Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Shipping Address</TableHead>
                  <TableHead>Payment Info</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const totalPrice = order.orderItems
                    ? order.orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
                    : 0;

                  return (
                    <TableRow key={order.id || order.orderName} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-xs text-primary font-mono">
                        {order.orderName || order.id?.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {order.shippingAddress?.emailAddress}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{order.shippingAddress?.addressLine}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground pl-4">
                          {order.shippingAddress?.state}, {order.shippingAddress?.country}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 text-slate-700">
                          <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{order.payment?.cardName}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground pl-4">
                          {order.payment?.cardNumber ? `•••• ${order.payment.cardNumber.slice(-4)}` : "Credit Card"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs font-semibold gap-1">
                          <Package className="h-3 w-3" />
                          {order.orderItems?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-sm text-emerald-600">
                        ${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="font-medium text-slate-700">No customer orders recorded yet.</p>
              <p>When you checkout in the store, orders will appear here in real time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


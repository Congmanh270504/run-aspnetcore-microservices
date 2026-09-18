import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Order Placed - Confirmation",
};

export default function ConfirmationPage() {
  return (
    <div className="container py-16">
      <div className="max-w-lg mx-auto border rounded-2xl p-8 bg-card shadow-lg text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Thank you for your order!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your order has been submitted successfully to the <strong>Ordering Microservice</strong> via RabbitMQ event-driven messaging.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground text-left space-y-1.5 border">
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Status:</span>
            <span className="text-emerald-600 font-semibold">Submitted (Pending)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Customer:</span>
            <span>swn (Default User)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Delivery:</span>
            <span>Standard Express (2-3 Business Days)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/orders" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2">
              <Package className="h-4 w-4" /> View My Orders
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full gap-2">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


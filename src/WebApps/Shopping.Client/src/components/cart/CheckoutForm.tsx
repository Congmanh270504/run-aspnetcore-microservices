"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { checkoutBasket } from "@/actions/basketActions";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, CreditCard, ShieldCheck, Loader2, AlertCircle, UserCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function CheckoutForm() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    emailAddress: "customer@example.com",
    addressLine: "123 Main Street",
    country: "United States",
    state: "California",
    zipCode: "90001",
    cardName: "John Doe",
    cardNumber: "4242 4242 4242 4242",
    expiration: "12/28",
    cvv: "123",
    paymentMethod: 1,
  });

  // Automatically pre-populate from logged-in Clerk account (Customer or Admin)
  React.useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        emailAddress: user.primaryEmailAddress?.emailAddress || prev.emailAddress,
        cardName: user.fullName || prev.cardName,
      }));
    }
  }, [isLoaded, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      setErrorMessage("Your cart is empty. Please add products before checking out.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const customerUserName = user?.username || user?.fullName || user?.id || "swn";
      const response = await checkoutBasket(
        {
          ...formData,
          customerId: user?.id,
          totalPrice: cart.totalPrice || 0,
        },
        customerUserName
      );

      if (response.success) {
        await refreshCart();
        router.push("/confirmation");
      } else {
        setErrorMessage(response.message || "Checkout failed. Please try again.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred during checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Checkout Form */}
      <div className="lg:col-span-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Shipping & Billing Address */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Billing & Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">First Name</label>
                <Input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Last Name</label>
                <Input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <Input
                required
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Street Address</label>
              <Input
                required
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Country</label>
                <Input
                  required
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="United States"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">State / Province</label>
                <Input
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="California"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Zip Code</label>
                <Input
                  required
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="90001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Name on Card</label>
              <Input
                required
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Card Number</label>
              <Input
                required
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="•••• •••• •••• ••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Expiration (MM/YY)</label>
                <Input
                  required
                  name="expiration"
                  value={formData.expiration}
                  onChange={handleChange}
                  placeholder="12/28"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">CVV / CVC</label>
                <Input
                  required
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Summary */}
      <div className="lg:col-span-4">
        <Card className="shadow-sm sticky top-24">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Order</CardTitle>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {cart.items.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex items-center justify-between text-sm py-1">
                <div>
                  <p className="font-semibold text-foreground line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} · {item.color}
                  </p>
                </div>
                <span className="font-medium text-emerald-600">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <Separator className="my-2" />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${Number(cart.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-xl text-emerald-600 font-extrabold">
                ${Number(cart.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting || cart.items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Place Order Now</span>
                </>
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}


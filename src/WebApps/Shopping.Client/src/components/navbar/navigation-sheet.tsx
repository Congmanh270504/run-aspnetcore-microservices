"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Crown, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/authUtils";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export const NavigationSheet = () => {
  const { user } = useUser();
  const { totalItemsCount } = useCart();
  const isAdmin = checkIsAdmin(user);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-6">
        <SheetHeader className="text-left pb-4 border-b">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <NavMenu orientation="vertical" className="mt-6" />

        <div className="mt-8 space-y-3 pt-6 border-t">
          <Link href="/cart" className="block">
            <Button variant="outline" className="w-full justify-between rounded-full font-semibold">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Shopping Cart
              </span>
              {totalItemsCount > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                  {totalItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {isAdmin ? (
            <Link href="/admin" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-start gap-2 rounded-full font-bold">
                <Crown className="h-4 w-4 text-amber-200" /> Admin Portal
              </Button>
            </Link>
          ) : (
            <Link href="/admin" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2 rounded-full text-amber-600 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Admin Access
              </Button>
            </Link>
          )}

          <SignedOut>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full rounded-full text-xs font-bold">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="w-full rounded-full text-xs font-bold">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Account Status</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </SheetContent>
    </Sheet>
  );
};

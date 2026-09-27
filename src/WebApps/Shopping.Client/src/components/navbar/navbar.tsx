"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { ShoppingCart, Crown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { checkIsAdmin } from "@/lib/authUtils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const { user } = useUser();
  const { totalItemsCount } = useCart();
  const isAdmin = checkIsAdmin(user);

  return (
    <nav className="fixed z-50 top-4 inset-x-4 h-14 xs:h-16 bg-background/70 backdrop-blur-md border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full shadow-md transition-all">
      <div className="h-full flex items-center justify-between mx-auto px-4 sm:px-6">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative rounded-full gap-1.5 font-semibold h-9 px-3">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden lg:inline">Cart</span>
              {totalItemsCount > 0 && (
                <Badge variant="default" className="ml-0.5 px-1.5 py-0 text-[11px] font-bold rounded-full">
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full gap-1.5 text-xs font-bold h-9">
                <Crown className="h-3.5 w-3.5 text-amber-200" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-full h-9">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="hidden xs:inline-flex rounded-full h-9">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center pl-1 border-l">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile Menu Sheet */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

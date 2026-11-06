"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  Search, 
  Package, 
  Home, 
  Menu, 
  X, 
  Phone,
  Store,
  ShieldCheck,
  LogIn,
  Crown
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SignInButton, 
  SignUpButton,
  SignedIn, 
  SignedOut, 
  UserButton,
  useUser 
} from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/authUtils";
import ThemeToggle from "@/components/landing/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      user.reload?.().catch(() => {});
    }
  }, [isLoaded]);

  const isAdmin = checkIsAdmin(user);
  const userRole = (user?.publicMetadata?.role as string) || (user?.unsafeMetadata?.role as string) || (isAdmin ? "admin" : "customer");

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Store },
    { name: "Cart", href: "/cart", icon: ShoppingCart },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-primary tracking-tight shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-sm text-sm">
            ES
          </div>
          <span className="hidden sm:inline-block">
            EShop<span className="text-foreground">App</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "text-primary font-bold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="relative hidden xl:block"
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-44 rounded-full border bg-muted/50 pl-9 pr-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </form>

          {/* Cart Icon Button */}
          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative rounded-full gap-2 font-semibold h-9 px-3">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <Badge variant="default" className="ml-0.5 px-1.5 py-0 text-[11px] font-bold rounded-full">
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Admin link button */}
          {isAdmin ? (
            <Link href="/admin">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full gap-1.5 text-xs font-bold shadow-xs h-9">
                <Crown className="h-3.5 w-3.5 text-amber-200" />
                <span className="hidden lg:inline">Admin Portal</span>
              </Button>
            </Link>
          ) : (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="rounded-full gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 h-9">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            </Link>
          )}

          {/* Clerk Auth controls */}
          <SignedOut>
            <div className="hidden sm:flex items-center gap-1.5">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold h-9">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="rounded-full text-xs font-semibold h-9">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2 pl-1 border-l">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setMobileMenuOpen(false);
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border bg-muted/50 pl-9 pr-3 text-xs"
            />
          </form>

          <nav className="space-y-1 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <SignedOut>
            <div className="pt-3 border-t grid grid-cols-2 gap-2">
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
        </div>
      )}
    </header>
  );
}

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

export function Header() {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-reload user profile on mount to sync any newly assigned Clerk dashboard metadata/roles immediately
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
            ES
          </div>
          <span>EShop<span className="text-foreground">App</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-md ${
                  isActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Search, Cart Button & Clerk Auth */}
        <div className="hidden md:flex items-center gap-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="relative"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-36 lg:w-52 rounded-md border border-input bg-muted/40 pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </form>

          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative gap-2 font-medium">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {totalItemsCount > 0 && (
                <Badge variant="default" className="ml-1 px-1.5 py-0.5 text-xs font-bold">
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Admin link / Badge */}
          {isAdmin ? (
            <Link href="/admin">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 text-xs font-bold shadow-sm">
                <Crown className="h-3.5 w-3.5 text-amber-200" />
                <span>Admin Portal</span>
              </Button>
            </Link>
          ) : (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          )}

          {/* Clerk Auth controls */}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="gap-1.5 text-xs font-semibold">
                  <span>Sign Up</span>
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2 pl-1 border-l">
              <div className="hidden xl:flex flex-col items-end text-right leading-tight">
                <span className="text-xs font-semibold text-foreground">
                  {user?.firstName || user?.username || "Account"}
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide flex items-center gap-0.5">
                    <Crown className="h-2.5 w-2.5" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {userRole}
                  </span>
                )}
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {totalItemsCount}
                </span>
              )}
            </Button>
          </Link>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-1">
              <SignInButton mode="modal">
                <Button size="sm" variant="ghost" className="text-xs px-2">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="text-xs px-2">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-3 space-y-2">
          {/* User Role Card in mobile */}
          <SignedIn>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/60 mb-3">
              <div>
                <p className="text-xs font-bold text-foreground">{user?.fullName || user?.username}</p>
                <p className="text-[11px] text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <Badge className={isAdmin ? "bg-amber-600 text-white text-[10px]" : "bg-slate-200 text-slate-800 text-[10px]"}>
                {isAdmin ? "Admin" : "Customer"}
              </Badge>
            </div>
          </SignedIn>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-2 border-t">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
            >
              <span className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                Admin Portal
              </span>
              <Badge className="bg-amber-600 text-white text-[10px]">Dashboard</Badge>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


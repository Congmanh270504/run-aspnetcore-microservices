"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Layers, 
  ShoppingCart, 
  Store, 
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Add Product", href: "/admin/products/new", icon: PlusCircle },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "All Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 border-r bg-slate-950 text-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Admin Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-9 w-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
            AD
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-tight leading-none">EShop Admin</h2>
            <span className="text-[11px] text-amber-400 font-medium">Control Center</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 text-sm font-medium">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 block">
            Management
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Return to Store */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-900/60">
          <UserButton afterSignOutUrl="/" />
          <div className="truncate text-xs">
            <p className="font-semibold text-white truncate">{user?.fullName || user?.username || "Admin User"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30 uppercase">
                {String(user?.publicMetadata?.role || "ADMIN")}
              </span>
            </div>
            <p className="text-slate-500 truncate text-[10px] mt-0.5">{user?.primaryEmailAddress?.emailAddress || "admin"}</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <Store className="h-4 w-4 text-emerald-400" />
          <span>Return to Customer Store</span>
        </Link>
      </div>
    </aside>
  );
}


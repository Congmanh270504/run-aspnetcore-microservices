import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/authUtils";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";

import { cookies, headers } from "next/headers";

export const metadata = {
    title: "Admin Dashboard - EShop Control Center",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const headerStore = headers();
    const allCookieNames = cookieStore.getAll().map((c) => c.name);
    console.log("AdminLayout Request Cookies:", allCookieNames);
    console.log("AdminLayout Auth Headers:", {
        status: headerStore.get("x-clerk-auth-status"),
        reason: headerStore.get("x-clerk-auth-reason"),
        message: headerStore.get("x-clerk-auth-message"),
    });

    const authData = auth();
    console.log("AdminLayout auth() userId:", authData.userId);

    const user = await currentUser();

    console.log("AdminLayout currentUser:", user?.id, user?.publicMetadata);

    // If user is not logged in, redirect to sign-in page with redirect_url
    if (!user) {
        redirect("/");
    }

    // Role check:
    // 1. Role trong metadata là "admin" (không phải "org:admin" trừ khi dùng Clerk Organizations)
    // 2. checkIsAdmin hỗ trợ check cả publicMetadata.role, unsafeMetadata, email admin, và dev flag
    const isAdmin = checkIsAdmin(user);
    // Hoặc kiểm tra trực tiếp: const isAdmin = user.publicMetadata?.role === "admin";

    // If user is not admin, show friendly Access Denied UI with instructions
    if (!isAdmin) {
        return <AdminAccessDenied user={user} />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Admin Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-slate-800">
                            Admin Portal
                        </span>
                        <span>/</span>
                        <span>Microservices Management</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Live Gateway Connected
                        </span>
                    </div>
                </header>

                {/* Dynamic Page Body */}
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}

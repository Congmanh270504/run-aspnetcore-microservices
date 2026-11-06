import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AppSidebar } from "@/components/admin/side-bar/app-sidebar";
import { SiteHeader } from "@/components/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
    title: "Admin Dashboard - EShop Control Center",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, sessionClaims } = await auth();
    const user = await currentUser();

    // If user is not logged in, redirect to sign-in page with redirect_url
    if (!userId && !user) {
        redirect("/sign-in?redirect_url=/admin");
    }

    // Check admin role from sessionClaims (token) or user.publicMetadata
    const role =
        (sessionClaims?.metadata?.role as string) ||
        (user?.publicMetadata?.role as string);
    const isAdmin = role === "admin";

    // Plain user object for Client Components (RSC boundary requires plain objects, not class instances)
    const userProfile = {
        id: userId || user?.id || "",
        fullName:
            user?.fullName ||
            `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
            "Admin",
        email:
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            "",
        imageUrl: user?.imageUrl || "",
        role: role || "customer",
    };

    // If user is not admin, show friendly Access Denied UI
    if (!isAdmin) {
        return <AdminAccessDenied user={userProfile} />;
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" user={userProfile} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

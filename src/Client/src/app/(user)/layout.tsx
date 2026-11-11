import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TooltipProvider>
            <CartProvider>
                <div className="min-h-screen bg-[#FAF9F6] flex flex-col  text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
                    <Navbar />
                    <main className="flex-1 pt-16 xs:pt-20">{children}</main>
                    <Footer />
                </div>
            </CartProvider>
        </TooltipProvider>
    );
}

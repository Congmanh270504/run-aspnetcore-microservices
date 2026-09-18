import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "EShop Microservices - Online Store",
    description:
        "Modern E-Commerce Store built with Next.js and ASP.NET Core Microservices",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
                >
                    <CartProvider>
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </CartProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

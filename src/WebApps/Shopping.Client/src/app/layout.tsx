import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

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
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                    >
                        {children}
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}


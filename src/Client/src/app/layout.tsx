import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Jost } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

const playfair = Playfair_Display({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-playfair",
    weight: ["400", "600", "700"],
    style: ["normal", "italic"],
});

const jost = Jost({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jost",
    weight: ["300", "400", "500", "600", "700"],
});

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
            <html lang="en" className={`${playfair.variable} ${jost.variable}`} suppressHydrationWarning>
                <body
                    className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased scrollbar-thin`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                    >
                        {children}
                        <Toaster richColors position="top-right" closeButton />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

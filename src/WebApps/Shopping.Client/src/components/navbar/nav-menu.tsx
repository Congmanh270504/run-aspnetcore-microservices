"use client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import Link from "next/link";

export const NavMenu = (props: NavigationMenuProps) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
            <NavigationMenuItem>
                <NavigationMenuLink
                    asChild
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Link href="/products">Products</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink
                    asChild
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Link href="#features">Features</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink
                    asChild
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Link href="#pricing">Pricing</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink
                    asChild
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Link href="#faq">FAQ</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink
                    asChild
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Link href="#testimonials">Testimonials</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
);

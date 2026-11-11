"use client";

import React from "react";
import Link from "next/link";
import { Search, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/landing/ThemeToggle";
import { DrawerCart } from "@/features/(users)/cart";
import { checkIsAdmin } from "@/lib/authUtils";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from "@clerk/nextjs";
import { NavigationSheet } from "./navigation-sheet";

export const Navbar = () => {
    const { user } = useUser();
    const isAdmin = checkIsAdmin(user);

    return (
        <nav className="fixed top-0 inset-x-0 z-50 h-16 sm:h-18 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-all">
            <div className="h-full  px-4 sm:px-8 flex items-center justify-between">
                {/* Left Section: Search Icon & Main Navigation */}
                <div className="flex items-center gap-6 sm:gap-8">
                    <Link
                        href="/products"
                        className="text-neutral-900 dark:text-neutral-100 hover:opacity-60 transition-opacity p-1 cursor-pointer"
                        aria-label="Search"
                    >
                        <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5]" />
                    </Link>

                    <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-normal tracking-[0.18em] uppercase text-neutral-900 dark:text-neutral-100">
                        <Link
                            href="/products"
                            className="hover:opacity-60 transition-opacity"
                        >
                            SHOP
                        </Link>
                        <Link
                            href="/products?category=Gifting"
                            className="hover:opacity-60 transition-opacity"
                        >
                            GIFTING
                        </Link>
                        <Link
                            href="/products?category=Bridal"
                            className="hover:opacity-60 transition-opacity"
                        >
                            BRIDAL
                        </Link>
                        <Link
                            href="/products?sort=newest"
                            className="hover:opacity-60 transition-opacity"
                        >
                            NEW
                        </Link>
                    </div>
                </div>

                {/* Center Section: SAINT VALENTINE Brand Logo */}
                <div className="flex items-center justify-center">
                    <Link
                        href="/"
                        className="font-serif italic text-lg sm:text-2xl font-normal tracking-[0.22em] uppercase text-neutral-900 dark:text-neutral-100 hover:opacity-85 transition-opacity select-none whitespace-nowrap"
                    >
                        SAINT VALENTINE
                    </Link>
                </div>

                {/* Right Section: Rewards, About Us, Theme, User Icon, DrawerCart */}
                <div className="flex items-center gap-3 sm:gap-5">
                    <div className="hidden lg:flex items-center gap-6 text-xs sm:text-[13px] font-normal tracking-[0.18em] uppercase text-neutral-900 dark:text-neutral-100 mr-1">
                        <Link
                            href="/rewards"
                            className="hover:opacity-60 transition-opacity"
                        >
                            REWARDS
                        </Link>
                        <Link
                            href="/about"
                            className="hover:opacity-60 transition-opacity"
                        >
                            ABOUT US
                        </Link>
                    </div>

                    <ThemeToggle />

                    {/* Cart Drawer */}
                    <DrawerCart />

                    {/* User Icon: Modal mode when signed out */}
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button
                                type="button"
                                className="p-1.5 text-neutral-900 dark:text-neutral-100 hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center"
                                aria-label="Account"
                            >
                                <User className="w-4 h-4 sm:w-[19px] sm:h-[19px] stroke-[1.5]" />
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>

                    {/* Mobile Menu Sheet */}
                    <div className="md:hidden">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

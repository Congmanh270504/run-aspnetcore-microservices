"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  GithubIcon,
  TwitterIcon,
  TwitchIcon,
  DribbbleIcon,
  Heart,
  Send,
} from "lucide-react";

const footerLinks = [
  { title: "Features", href: "#features" },
  { title: "Pricing", href: "#pricing" },
  { title: "FAQ", href: "#faq" },
  { title: "Testimonials", href: "#testimonials" },
  { title: "Products", href: "/products" },
  { title: "Orders", href: "/orders" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="border-t bg-background text-foreground mt-24">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-0">
        <div className="py-12 flex flex-col sm:flex-row items-start justify-between gap-x-8 gap-y-10">
          <div className="space-y-4 max-w-md">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-primary tracking-tight">
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                ES
              </div>
              <span>
                EShop<span className="text-foreground">App</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enterprise e-commerce platform built with Next.js 14, Tailwind CSS,
              ASP.NET Core 8 Microservices, PostgreSQL, and Redis.
            </p>

            <ul className="flex items-center gap-4 flex-wrap text-sm font-semibold">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe Newsletter */}
          <div className="max-w-xs w-full space-y-3">
            <h4 className="font-bold text-base">Stay up to date</h4>
            <p className="text-xs text-muted-foreground">
              Subscribe to get notified about new arrivals and exclusive discount offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
              <Button type="submit" size="sm" className="h-10 px-4 rounded-xl font-bold gap-1">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-600 font-semibold animate-in fade-in">
                ✓ Thanks for subscribing!
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-4 gap-y-4 text-xs text-muted-foreground">
          {/* Copyright */}
          <p className="text-center sm:text-start">
            &copy; {new Date().getFullYear()} EShop Microservices. All rights reserved.
          </p>

          <p className="flex items-center gap-1 font-medium">
            Crafted with Next.js & ASP.NET Core <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </p>

          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <DribbbleIcon className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <TwitchIcon className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <GithubIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

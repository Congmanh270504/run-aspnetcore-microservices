"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleHelp, ArrowRight } from "lucide-react";
import Link from "next/link";

const tooltipContent = {
  shipping: "Free express shipping on all orders nationwide without order minimums.",
  discount: "Applied automatically at checkout for all eligible products.",
  support: "Direct line to senior customer success representatives 24/7.",
};

const YEARLY_DISCOUNT = 20;

interface FeatureItem {
  title: string;
  tooltip?: string;
}

interface Plan {
  name: string;
  price: number;
  isRecommended?: boolean;
  isPopular?: boolean;
  description: string;
  features: FeatureItem[];
  buttonText: string;
  href: string;
}

const plans: Plan[] = [
  {
    name: "Standard Member",
    price: 0,
    description: "Ideal for occasional shoppers looking for high-quality electronics.",
    features: [
      { title: "Standard Delivery within 3 days" },
      { title: "Standard 1-Year Warranty" },
      { title: "Regular Product Updates" },
      { title: "Access to Seasonal Sales" },
    ],
    buttonText: "Start Shopping",
    href: "/products",
  },
  {
    name: "VIP Premium Pass",
    price: 19,
    isPopular: true,
    description: "Designed for tech enthusiasts seeking exclusive deals and instant delivery.",
    features: [
      { title: "Free Next-Day Express Shipping", tooltip: tooltipContent.shipping },
      { title: "Extra 10% Off All Tech Deals", tooltip: tooltipContent.discount },
      { title: "Extended 2-Year Full Warranty" },
      { title: "Priority VIP Customer Care 24/7", tooltip: tooltipContent.support },
      { title: "Early Access to Flash Sales" },
    ],
    buttonText: "Join VIP Pass",
    href: "/sign-up",
  },
  {
    name: "Enterprise Business",
    price: 49,
    description: "Tailored for businesses needing bulk orders, invoicing, and dedicated managers.",
    features: [
      { title: "Custom Bulk Volume Discounts" },
      { title: "Dedicated Corporate Account Manager" },
      { title: "Tax-Exempt & Invoice Billing" },
      { title: "Same-Day Delivery Options" },
      { title: "3-Year Commercial Warranty" },
    ],
    buttonText: "Contact Business Team",
    href: "/contact",
  },
];

export default function Pricing() {
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState("monthly");

  return (
    <div
      id="pricing"
      className="flex flex-col items-center justify-center py-16 xs:py-24 px-6"
    >
      <div className="text-center max-w-2xl">
        <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Membership Plans
        </span>
        <h2 className="mt-4 text-3xl xs:text-4xl md:text-5xl font-extrabold tracking-tight">
          Unlock Special Shopping Perks
        </h2>
        <p className="mt-3 text-muted-foreground text-base">
          Choose a membership plan to save more on every gadget order.
        </p>
      </div>

      <Tabs
        value={selectedBillingPeriod}
        onValueChange={setSelectedBillingPeriod}
        className="mt-8"
      >
        <TabsList className="h-11 px-1.5 rounded-full bg-muted">
          <TabsTrigger value="monthly" className="py-1.5 rounded-full text-xs font-semibold">
            Monthly Billing
          </TabsTrigger>
          <TabsTrigger value="yearly" className="py-1.5 rounded-full text-xs font-semibold">
            Yearly (Save {YEARLY_DISCOUNT}%)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-12 max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8 w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative border rounded-2xl p-7 bg-background flex flex-col justify-between shadow-sm transition-all hover:shadow-md",
              {
                "border-2 border-primary shadow-lg bg-background scale-105 z-10": plan.isPopular,
              }
            )}
          >
            {plan.isPopular && (
              <Badge className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-primary text-primary-foreground font-bold px-3 py-1 shadow">
                Most Popular
              </Badge>
            )}
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-3 text-4xl font-black">
                $
                {selectedBillingPeriod === "monthly"
                  ? plan.price
                  : Math.round(plan.price * ((100 - YEARLY_DISCOUNT) / 100))}
                <span className="ml-1.5 text-sm text-muted-foreground font-normal">
                  /month
                </span>
              </p>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                {plan.description}
              </p>

              <Separator className="my-6" />

              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-2">
                    <CircleCheck className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span className="flex-1 text-xs text-foreground/90">{feature.title}</span>
                    {feature.tooltip && (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <CircleHelp className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>{feature.tooltip}</TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link href={plan.href} className="w-full block">
                <Button
                  variant={plan.isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full font-semibold gap-2"
                >
                  {plan.buttonText} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import {
  Truck,
  ShieldCheck,
  Headphones,
  Zap,
  ShoppingBag,
  Cpu,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Express Global Delivery",
    description:
      "Fast, reliable express shipping with real-time order tracking right to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description:
      "100% encrypted transactions and secure authentication powered by OAuth 2.0 & Clerk.",
  },
  {
    icon: Headphones,
    title: "24/7 VIP Customer Care",
    description:
      "Dedicated support team available round the clock via live chat and direct phone lines.",
  },
  {
    icon: Zap,
    title: "Ultra-Fast Performance",
    description:
      "Blazing fast microservice response times powered by ASP.NET Core 8 & Redis distributed caching.",
  },
  {
    icon: ShoppingBag,
    title: "Smart Shopping Cart",
    description:
      "Seamless basket state synchronization across devices with instant checkout capabilities.",
  },
  {
    icon: Cpu,
    title: "Curated Tech Gadgets",
    description:
      "Handpicked top-tier electronics, laptops, wearables, and cutting-edge hardware accessories.",
  },
];

export default function Features() {
  return (
    <div id="features" className="w-full py-16 xs:py-24 px-6 bg-slate-50/50 dark:bg-background border-y">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight">
            Next-Gen Shopping Experience
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Built with modern web standards and enterprise architecture to deliver exceptional reliability.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col bg-background border rounded-2xl py-7 px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 h-12 w-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

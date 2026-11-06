import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Marquee from "@/components/ui/marquee";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Tech Lead",
    rating: 5,
    comment:
      "The fast express shipping and genuine product warranty impressed me. Orders arrive in under 48 hours!",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    role: "UX Specialist",
    rating: 5,
    comment:
      "Intuitive store UI and super seamless checkout. The microservices backend makes page loads instant.",
  },
  {
    id: 3,
    name: "David Chen",
    role: "DevOps Engineer",
    rating: 5,
    comment:
      "Ordered a premium wireless mechanical keyboard. Unboxing experience and build quality were top notch.",
  },
  {
    id: 4,
    name: "Emily Watson",
    role: "Product Manager",
    rating: 5,
    comment:
      "The VIP pass perks paid for themselves on my very first laptop order. Customer service is 10/10.",
  },
  {
    id: 5,
    name: "Marcus Vance",
    role: "Software Architect",
    rating: 5,
    comment:
      "Great selection of cutting-edge gadgets and developer gear. Highly recommend this store!",
  },
  {
    id: 6,
    name: "Sarah Jenkins",
    role: "Creative Director",
    rating: 5,
    comment:
      "Clean dark mode aesthetics and crystal clear order tracking updates via email and SMS.",
  },
];

export default function Testimonials() {
  return (
    <div id="testimonials" className="py-16 xs:py-24 overflow-hidden">
      <div className="text-center max-w-2xl mx-auto px-6 mb-12">
        <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Customer Love
        </span>
        <h2 className="mt-4 text-3xl xs:text-4xl md:text-5xl font-extrabold tracking-tight">
          What Our Shoppers Say
        </h2>
        <p className="mt-3 text-muted-foreground text-base">
          Real feedback from verified buyers across the globe.
        </p>
      </div>

      <div className="relative">
        <div className="z-10 absolute left-0 inset-y-0 w-[12%] bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="z-10 absolute right-0 inset-y-0 w-[12%] bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <Marquee pauseOnHover className="[--duration:30s]">
          {testimonials.slice(0, 3).map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </Marquee>

        <Marquee pauseOnHover reverse className="mt-4 [--duration:30s]">
          {testimonials.slice(3, 6).map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: (typeof testimonials)[0] }) {
  return (
    <div className="min-w-[320px] max-w-sm bg-background border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed italic">
          &quot;{item.comment}&quot;
        </p>
      </div>
      <div className="flex items-center gap-3 mt-6 pt-4 border-t">
        <Avatar className="h-10 w-10 border">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {item.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-sm font-bold leading-tight">{item.name}</h4>
          <p className="text-xs text-muted-foreground">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

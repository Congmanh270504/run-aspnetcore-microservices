import React from "react";
import {
  Undo2,
  Route,
  Truck,
  BadgeDollarSign,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

const faq = [
  {
    icon: Undo2,
    question: "What is your return policy?",
    answer:
      "You can return unused items in their original packaging within 30 days for a full refund or exchange. Contact support for instant return labels.",
  },
  {
    icon: Route,
    question: "How do I track my order?",
    answer:
      "Track your order live using the link in your email confirmation, or log in and navigate to the Orders section in your dashboard.",
  },
  {
    icon: Truck,
    question: "Do you ship internationally?",
    answer:
      "Yes! We deliver worldwide via express courier partners. Shipping fees and estimated delivery times are calculated transparently at checkout.",
  },
  {
    icon: BadgeDollarSign,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, and Google Pay with 100% encrypted checkout.",
  },
  {
    icon: ShieldCheck,
    question: "What if I receive a damaged item?",
    answer:
      "Reach out to our VIP support team within 48 hours with photos. We will immediately ship a replacement item free of charge.",
  },
  {
    icon: UserRoundCheck,
    question: "How can I contact customer support?",
    answer:
      "Reach out 24/7 via live chat or email us at support@eshop-microservices.com for immediate assistance.",
  },
];

export default function FAQ() {
  return (
    <div
      id="faq"
      className="py-16 xs:py-24 px-6 bg-slate-50/50 dark:bg-background border-t"
    >
      <div className="max-w-screen-lg mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Got Questions?
          </span>
          <h2 className="mt-4 text-3xl xs:text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground text-base">
            Quick answers to common questions about orders, shipping, and warranty.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {faq.map(({ question, answer, icon: Icon }) => (
            <div
              key={question}
              className="border rounded-2xl p-6 bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {question}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

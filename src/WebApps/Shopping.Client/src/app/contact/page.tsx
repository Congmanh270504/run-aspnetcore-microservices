import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata = {
  title: "Contact Us - EShop Microservices",
};

export default function ContactPage() {
  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Contact Us</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Have any questions about products or microservices architecture? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
                    <Input placeholder="Your full name" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                    <Input type="email" placeholder="name@example.com" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
                  <Input placeholder="Inquiry about order or products" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Write your message here..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>

                <Button type="button" className="gap-2 font-semibold">
                  <Send className="h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Headquarters</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    District 1, Ho Chi Minh City<br />Vietnam
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Email</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    support@eshop-microservices.com<br />
                    sales@eshop-microservices.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Phone</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    +84 (0) 123 456 789<br />
                    Mon - Fri, 9am - 6pm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


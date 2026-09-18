import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-200 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight">About EShop</h3>
            <div className="h-0.5 w-12 bg-primary"></div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A modern microservices e-commerce application built with Next.js, ASP.NET Core, PostgreSQL, Redis, RabbitMQ, and Yarp API Gateway.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Quick Links</h3>
            <div className="h-0.5 w-12 bg-primary"></div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Microservices</h3>
            <div className="h-0.5 w-12 bg-primary"></div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Catalog.API (PostgreSQL & Marten)</li>
              <li>Basket.API (Redis & PostgreSQL)</li>
              <li>Discount.Grpc (SQLite & Grpc)</li>
              <li>Ordering.API (Clean Architecture & CQRS)</li>
              <li>Yarp API Gateway</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Contact Us</h3>
            <div className="h-0.5 w-12 bg-primary"></div>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Ho Chi Minh City, Vietnam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@eshop-microservices.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+84 (0) 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EShop Microservices. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js & ASP.NET Core with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}


import React from "react";
import { cn } from "@/lib/utils";
import { Cpu, Server, Database, Cloud, Shield, Zap } from "lucide-react";

interface LogoCloudProps {
  className?: string;
}

const partners = [
  { name: "ASP.NET Core 8", icon: Server },
  { name: "PostgreSQL & Marten", icon: Database },
  { name: "RabbitMQ & MassTransit", icon: Zap },
  { name: "Redis Cache", icon: Cpu },
  { name: "Docker Container", icon: Cloud },
  { name: "Clerk Auth", icon: Shield },
];

export default function LogoCloud({ className }: LogoCloudProps) {
  return (
    <div className={cn("w-full py-6", className)}>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        Powered by Enterprise-Grade Tech Stack & Microservices
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80">
        {partners.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 font-medium text-sm text-foreground/70 hover:text-primary transition-colors cursor-default"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import type { ProductType } from "@/types";
import { cn } from "@/lib/utils";

export interface ProductTypeBadgeProps {
    value?: string | ProductType | null;
    type?: string | ProductType | null;
    showDot?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export interface PaletteStyle {
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
}

const HASH_PALETTES: PaletteStyle[] = [
    {
        bgColor: "bg-blue-50 dark:bg-blue-950/40",
        textColor: "text-blue-700 dark:text-blue-300",
        borderColor: "border-blue-500/30",
        dotColor: "bg-blue-500",
    },
    {
        bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
        textColor: "text-emerald-700 dark:text-emerald-300",
        borderColor: "border-emerald-500/30",
        dotColor: "bg-emerald-500",
    },
    {
        bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
        textColor: "text-indigo-700 dark:text-indigo-300",
        borderColor: "border-indigo-500/30",
        dotColor: "bg-indigo-500",
    },
    {
        bgColor: "bg-purple-50 dark:bg-purple-950/40",
        textColor: "text-purple-700 dark:text-purple-300",
        borderColor: "border-purple-500/30",
        dotColor: "bg-purple-500",
    },
    {
        bgColor: "bg-pink-50 dark:bg-pink-950/40",
        textColor: "text-pink-700 dark:text-pink-300",
        borderColor: "border-pink-500/30",
        dotColor: "bg-pink-500",
    },
    {
        bgColor: "bg-rose-50 dark:bg-rose-950/40",
        textColor: "text-rose-700 dark:text-rose-300",
        borderColor: "border-rose-500/30",
        dotColor: "bg-rose-500",
    },
    {
        bgColor: "bg-amber-50 dark:bg-amber-950/40",
        textColor: "text-amber-700 dark:text-amber-300",
        borderColor: "border-amber-500/30",
        dotColor: "bg-amber-500",
    },
    {
        bgColor: "bg-orange-50 dark:bg-orange-950/40",
        textColor: "text-orange-700 dark:text-orange-300",
        borderColor: "border-orange-500/30",
        dotColor: "bg-orange-500",
    },
    {
        bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
        textColor: "text-cyan-700 dark:text-cyan-300",
        borderColor: "border-cyan-500/30",
        dotColor: "bg-cyan-500",
    },
    {
        bgColor: "bg-teal-50 dark:bg-teal-950/40",
        textColor: "text-teal-700 dark:text-teal-300",
        borderColor: "border-teal-500/30",
        dotColor: "bg-teal-500",
    },
    {
        bgColor: "bg-sky-50 dark:bg-sky-950/40",
        textColor: "text-sky-700 dark:text-sky-300",
        borderColor: "border-sky-500/30",
        dotColor: "bg-sky-500",
    },
    {
        bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
        textColor: "text-fuchsia-700 dark:text-fuchsia-300",
        borderColor: "border-fuchsia-500/30",
        dotColor: "bg-fuchsia-500",
    },
    {
        bgColor: "bg-lime-50 dark:bg-lime-950/40",
        textColor: "text-lime-700 dark:text-lime-300",
        borderColor: "border-lime-500/30",
        dotColor: "bg-lime-500",
    },
    {
        bgColor: "bg-violet-50 dark:bg-violet-950/40",
        textColor: "text-violet-700 dark:text-violet-300",
        borderColor: "border-violet-500/30",
        dotColor: "bg-violet-500",
    },
];

export function getProductTypeHashStyle(name: string): PaletteStyle {
    const trimmed = (name || "").trim();
    if (!trimmed) return HASH_PALETTES[0];
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
        hash = (hash << 5) - hash + trimmed.charCodeAt(i);
        hash |= 0;
    }
    return HASH_PALETTES[Math.abs(hash) % HASH_PALETTES.length];
}

export function ProductTypeBadge({
    value,
    type,
    showDot = true,
    className,
    size = "sm",
}: ProductTypeBadgeProps) {
    const rawVal = value ?? type;

    let typeName = "";
    if (typeof rawVal === "string") {
        typeName = rawVal;
    } else if (rawVal && typeof rawVal === "object" && "name" in rawVal) {
        typeName = rawVal.name || "";
    }

    if (!typeName) return <span className="text-muted-foreground text-xs">—</span>;

    const style = getProductTypeHashStyle(typeName);

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs font-semibold",
        md: "px-2.5 py-1 text-xs sm:text-sm font-semibold",
        lg: "px-3 py-1.5 text-sm font-bold",
    }[size];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border shadow-none transition-colors",
                style.bgColor,
                style.textColor,
                style.borderColor,
                sizeClasses,
                className,
            )}
            title={typeName}
        >
            {showDot && (
                <span
                    className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        style.dotColor,
                    )}
                />
            )}
            <span className="font-medium tracking-wide">{typeName}</span>
        </span>
    );
}

export default ProductTypeBadge;

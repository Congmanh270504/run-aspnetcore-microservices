"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface FormMultiSelectProps {
    options: Option[];
    placeholder?: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    className?: string;
    disabled?: boolean;
}

export default function FormMultiSelect({
    options,
    placeholder = "Chọn nhiều mục",
    value = [],
    onChange,
    className = "",
    disabled = false,
}: FormMultiSelectProps) {
    const isControlled = onChange !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(value);

    const currentValue = isControlled ? value : internalValue;

    const handleSelect = (val: string) => {
        let newValue = [...currentValue];
        if (newValue.includes(val)) {
            newValue = newValue.filter((v) => v !== val);
        } else {
            newValue.push(val);
        }

        if (!isControlled) setInternalValue(newValue);
        if (onChange) onChange(newValue);
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    disabled={disabled}
                    className={`flex items-start justify-between gap-2 input-modern w-full min-h-10.5 max-h-30 h-auto py-1.5 px-3 overflow-y-auto
                        ${currentValue.length === 0 ? "text-muted-foreground/60" : "text-foreground"} 
                        ${disabled ? "opacity-50 cursor-not-allowed bg-muted/50" : ""} 
                        ${className}`}
                >
                    <div className="flex-1 flex flex-wrap gap-1.5 items-center text-left py-0.5">
                        {currentValue.length === 0 ? (
                            <span className="truncate text-sm">{placeholder}</span>
                        ) : (
                            currentValue.map((v) => {
                                const label =
                                    options.find(
                                        (opt) =>
                                            String(opt.value) === String(v),
                                    )?.label || v;
                                return (
                                    <span
                                        key={v}
                                        className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
                                    >
                                        <span className="truncate max-w-37.5">{label}</span>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="text-primary/70 hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSelect(v);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSelect(v);
                                                }
                                            }}
                                        >
                                            <X className="w-3 h-3" />
                                        </div>
                                    </span>
                                );
                            })
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 self-center mt-1" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="z-200 w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto"
            >
                {options.map((opt) => (
                    <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={currentValue.includes(String(opt.value))}
                        onCheckedChange={() => handleSelect(opt.value)}
                        className={
                            currentValue.includes(String(opt.value))
                                ? "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary"
                                : ""
                        }
                        onSelect={(e) => e.preventDefault()} // Ngăn đóng dropdown khi click checkbox
                    >
                        {opt.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

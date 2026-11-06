"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DatePickerSimpleProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    /** Alias cho value */
    date?: Date;
    /** Alias cho onChange */
    onSelect?: (date: Date | undefined) => void;
    label?: string;
    id?: string;
    className?: string;
    required?: boolean;
    classField?: string;
    min?: Date;
    max?: Date;
    showIcon?: boolean;
    disabled?: boolean;
    buttonHeight?: string;
    showTime?: boolean;
}

export function DatePickerSimple({
    value: valueProp,
    onChange: onChangeProp,
    date,
    onSelect,
    label = "Date",
    id = "date-picker-simple",
    className,
    required = false,
    classField,
    min,
    max,
    showIcon = true,
    disabled = false,
    buttonHeight,
    showTime = false,
}: DatePickerSimpleProps) {
    const [open, setOpen] = React.useState(false);

    const rawValue = valueProp ?? date;
    const handleChange = onChangeProp ?? onSelect;

    // Phải đảm bảo rawValue là một Date hợp lệ trước khi format hoặc truyền vào Calendar
    const value =
        rawValue && rawValue instanceof Date && !isNaN(rawValue.getTime())
            ? rawValue
            : undefined;

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            handleChange?.(undefined);
            return;
        }

        const newDate = new Date(selectedDate);
        if (showTime) {
            const hours = value ? value.getHours() : new Date().getHours();
            const minutes = value
                ? value.getMinutes()
                : new Date().getMinutes();
            newDate.setHours(hours, minutes, 0, 0);
        }

        handleChange?.(newDate);
        if (!showTime) {
            setOpen(false);
        }
    };

    const handleTimeChange = (timeStr: string) => {
        if (!timeStr) return;
        const [h, m] = timeStr.split(":").map(Number);
        const baseDate = value ? new Date(value) : new Date();
        baseDate.setHours(h || 0, m || 0, 0, 0);
        handleChange?.(baseDate);
    };

    return (
        <Field className={`w-full ${classField || "gap-0"}`}>
            {label !== "" && (
                <FieldLabel
                    htmlFor={id}
                    className={`mb-0.75 ${className || ""}`}
                >
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                </FieldLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    asChild
                    className="border-blue-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-500/30"
                >
                    <Button
                        variant="outline"
                        id={id}
                        disabled={disabled}
                        className={`w-full justify-start px-2.5 font-normal hover:bg-transparent ${className || ""} ${buttonHeight}`}
                    >
                        {showIcon && <CalendarIcon />}
                        <span
                            className={`mt-0.5 ${!value ? "text-muted-foreground" : ""}`}
                        >
                            {value
                                ? format(
                                      value,
                                      showTime
                                          ? "HH:mm dd-MM-yyyy "
                                          : "dd-MM-yyyy",
                                  )
                                : "Chọn ngày"}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        defaultMonth={value}
                        disabled={
                            min || max
                                ? [
                                      ...(min ? [{ before: min }] : []),
                                      ...(max ? [{ after: max }] : []),
                                  ]
                                : undefined
                        }
                    />
                    {showTime && (
                        <div className="p-2.5 border-t border-border grid grid-cols-2 gap-2 bg-muted/20">
                            <Label
                                htmlFor="time-picker-optional "
                                className="text-center items-center content-center"
                            >
                                Time
                            </Label>
                            <Input
                                type="time"
                                value={
                                    value
                                        ? format(value, "HH:mm")
                                        : format(new Date(), "HH:mm")
                                }
                                onChange={(e) =>
                                    handleTimeChange(e.target.value)
                                }
                                id="time-picker-optional"
                                step="1"
                                defaultValue="10:30:00"
                                className="justify-center appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </Field>
    );
}

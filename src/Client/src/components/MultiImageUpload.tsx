"use client";

import { useCallback, useRef } from "react";
import { Plus, X, Image as ImageIcon, Loader2, Star } from "lucide-react";
import { useMultipleFileUpload } from "@/hooks/useFileUpload";
import Image from "next/image";

interface MultiImageUploadProps {
    /** Array of image URLs */
    value?: string[];
    /** Callback returning updated array of image URLs */
    onChange: (urls: string[]) => void;
    /** Target folder for uploaded images */
    folder?: string;
    /** Max allowed files */
    maxFiles?: number;
    /** Disabled state */
    disabled?: boolean;
}

export default function MultiImageUpload({
    value = [],
    onChange,
    folder = "products",
    maxFiles = 10,
    disabled = false,
}: MultiImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const { uploadMultiple, uploading, error } = useMultipleFileUpload({
        folder,
        type: "image",
        onError: (err) => {
            console.error("Image upload error:", err);
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = maxFiles - value.length;
        const filesToUpload = files
            .slice(0, remainingSlots)
            .map((file) => ({ file }));

        if (filesToUpload.length === 0) return;

        try {
            const uploadedFiles = await uploadMultiple(filesToUpload);
            const newUrls = uploadedFiles.map((f) => f.url);
            onChange([...value, ...newUrls]);
        } catch (err) {
            console.error("Failed to upload images:", err);
        } finally {
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemove = useCallback(
        (indexToRemove: number) => {
            const nextUrls = value.filter((_, idx) => idx !== indexToRemove);
            onChange(nextUrls);
        },
        [value, onChange],
    );

    const handleSetPrimary = useCallback(
        (indexToMakePrimary: number) => {
            if (indexToMakePrimary === 0) return;
            const targetUrl = value[indexToMakePrimary];
            const otherUrls = value.filter(
                (_, idx) => idx !== indexToMakePrimary,
            );
            onChange([targetUrl, ...otherUrls]);
        },
        [value, onChange],
    );

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Existing uploaded images */}
                {value.map((url, index) => {
                    const isPrimary = index === 0;
                    const isRemote = url.startsWith("http");
                    const imgSrc = isRemote
                        ? url
                        : url.startsWith("/images/")
                          ? url
                          : `/images/product/${url}`;

                    return (
                        <div
                            key={`${url}-${index}`}
                            className={`group relative aspect-square rounded-lg border-2 overflow-hidden bg-muted/30 transition-all ${
                                isPrimary
                                    ? "border-primary shadow-xs ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            <Image
                                src={imgSrc}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-contain p-1"
                                unoptimized
                            />

                            {/* Primary Image Badge */}
                            {isPrimary ? (
                                <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 z-10">
                                    <Star className="w-2.5 h-2.5 fill-current" />{" "}
                                    Chính
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSetPrimary(index)}
                                    className="absolute top-1.5 left-1.5 bg-black/60 text-white hover:bg-primary text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    Đặt làm ảnh chính
                                </button>
                            )}

                            {/* Remove button */}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive/90 text-white rounded-full flex items-center justify-center shadow-md hover:bg-destructive transition-colors opacity-90 group-hover:opacity-100 z-10 cursor-pointer"
                                    title="Xóa ảnh"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Upload box */}
                {value.length < maxFiles && (
                    <button
                        type="button"
                        disabled={disabled || uploading}
                        onClick={() => inputRef.current?.click()}
                        className={`aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            disabled || uploading
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    Đang tải...
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-foreground">
                                    Upload Images
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />

            {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
            )}
        </div>
    );
}

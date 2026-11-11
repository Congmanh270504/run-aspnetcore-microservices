"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Heart, Loader2, Check, Star } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from "@/features/(users)/products/components/ProductCard";
import { ProductQuickViewDialog } from "@/features/(users)/products/components/ProductQuickViewDialog";
import { DisplayProduct } from "@/features/(users)/products/types";

interface Props {
    product: Product;
    popularProducts?: Product[];
    colorVariants?: Product[];
}

const DEFAULT_POPULAR: Product[] = [
    {
        id: "wooden-chair",
        name: "Wooden Chair",
        price: 299,
        category: ["Furniture", "Chairs"],
        description: "A clean-lined chair in a modern minimalist style.",
        imageFile: "product-1.png",
    },
    {
        id: "chair-collection",
        name: "Chair Collection",
        price: 599,
        category: ["Furniture", "Chairs"],
        description: "A trio of minimalist Scandinavian accent chairs.",
        imageFile: "product-2.png",
    },
    {
        id: "cloud-chair",
        name: "Cloud Chair",
        price: 199,
        category: ["Furniture", "Chairs"],
        description: "Soft curved cushion chair with metal legs.",
        imageFile: "product-3.png",
    },
];

function resolveImageUrl(imageFile?: string): string {
    if (!imageFile) return "/images/placeholder.png";
    if (imageFile.startsWith("http") || imageFile.startsWith("/")) {
        return imageFile;
    }
    return `/images/product/${imageFile}`;
}

function toDisplayProduct(p: Product, idx = 0): DisplayProduct {
    const displayName = p.name || p.title || `Product ${idx + 1}`;
    const primaryCat =
        Array.isArray(p.category) && p.category.length > 0
            ? p.category[0]
            : typeof p.product_type === "string"
              ? p.product_type
              : "General";

    let displayImage = "/images/placeholder.png";
    if (p.images && p.images.length > 0 && p.images[0]?.src) {
        displayImage = p.images[0].src;
    } else if (p.imageFile?.startsWith("http")) {
        displayImage = p.imageFile;
    } else if (p.imageFile) {
        displayImage = `/images/product/${p.imageFile}`;
    }

    const rawPrice = Number(p.price ?? p.variants?.[0]?.price ?? 0);
    const comparePrice = p.variants?.[0]?.compare_at_price
        ? Number(p.variants[0].compare_at_price)
        : 0;

    const discountAmount =
        typeof p.discount === "number"
            ? p.discount
            : p.discount && typeof p.discount === "object"
              ? Number(p.discount.amount || 0)
              : 0;

    let originalPrice = rawPrice;
    let displayPrice = rawPrice;
    let discountPercent = 0;

    if (discountAmount > 0) {
        originalPrice = rawPrice;
        displayPrice = Math.max(0, rawPrice - discountAmount);
        discountPercent = Math.round((discountAmount / rawPrice) * 100);
    } else if (comparePrice > rawPrice) {
        originalPrice = comparePrice;
        displayPrice = rawPrice;
        discountPercent = Math.round(
            ((comparePrice - rawPrice) / comparePrice) * 100,
        );
    }

    let hoverImage: string | undefined = undefined;
    if (Array.isArray(p.images) && p.images.length > 0) {
        const pos6 = p.images.find(
            (img: any) =>
                img &&
                typeof img === "object" &&
                (img.position === 6 || Number(img.position) === 6),
        );
        if (pos6?.src) {
            hoverImage = pos6.src;
        } else if (p.images[1]?.src) {
            hoverImage = p.images[1].src;
        } else if (typeof p.images[1] === "string") {
            hoverImage = p.images[1];
        }
    }

    return {
        ...p,
        displayName,
        displayImage,
        hoverImage,
        displayPrice,
        originalPrice,
        discountPercent,
        rating: 4.8 + (idx % 3) * 0.1,
        reviewsCount: 12 + idx * 3,
        primaryCategory: primaryCat,
        skinType: "Normal",
        isBestSeller: idx < 3,
        isNewArrival: idx % 2 === 0,
        isOnSale: discountPercent > 0,
        inStock: true,
    };
}

export function ProductDetailClient({
    product,
    popularProducts = [],
    colorVariants: initialColorVariants = [],
}: Props) {
    const { addToCart } = useCart();

    const resolvedColorVariants = useMemo(() => {
        let list = initialColorVariants;
        const currentTitle = product.name || product.title || "";
        const lastDash = currentTitle.lastIndexOf("-");

        if ((!list || list.length <= 1) && lastDash !== -1) {
            const baseTitle = currentTitle
                .substring(0, lastDash)
                .trim()
                .toLowerCase();
            const pool = [product, ...popularProducts];
            const seen = new Set<string>();
            const matches: Product[] = [];
            for (const p of pool) {
                if (!p || seen.has(p.id)) continue;
                const pTitle = (p.name || p.title || "").toLowerCase();
                const pDash = pTitle.lastIndexOf("-");
                if (
                    pDash !== -1 &&
                    pTitle.substring(0, pDash).trim() === baseTitle
                ) {
                    seen.add(p.id);
                    matches.push(p);
                }
            }
            if (matches.length > 1) {
                list = matches;
            }
        }

        if (!list || list.length === 0) {
            list = [product];
        }

        return [...list].sort((a, b) => {
            const aTitle = a.name || a.title || "";
            const bTitle = b.name || b.title || "";
            return aTitle.localeCompare(bTitle);
        });
    }, [initialColorVariants, product, popularProducts]);

    const variants = useMemo(() => {
        if (Array.isArray(product.variants) && product.variants.length > 0) {
            return product.variants;
        }
        return [];
    }, [product.variants]);

    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        if (Array.isArray(product.variants) && product.variants.length > 0) {
            return product.variants[0];
        }
        return null;
    });

    React.useEffect(() => {
        if (Array.isArray(product.variants) && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        } else {
            setSelectedVariant(null);
        }
    }, [product.variants]);

    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isFavorited, setIsFavorited] = useState<boolean>(false);
    const [popularFavorites, setPopularFavorites] = useState<
        Record<string, boolean>
    >({});

    const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);
    const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
    const [reviews, setReviews] = useState<
        Array<{
            id: string;
            author: string;
            rating: number;
            title: string;
            comment: string;
            date: string;
        }>
    >([]);
    const [newRating, setNewRating] = useState<number>(5);
    const [newAuthor, setNewAuthor] = useState<string>("");
    const [newTitle, setNewTitle] = useState<string>("");
    const [newComment, setNewComment] = useState<string>("");
    const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAuthor.trim() || !newComment.trim()) return;

        const newRev = {
            id: Date.now().toString(),
            author: newAuthor.trim(),
            rating: newRating,
            title: newTitle.trim() || "Verified Buyer",
            comment: newComment.trim(),
            date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        };

        setReviews((prev) => [newRev, ...prev]);
        setReviewSuccess(true);
        setTimeout(() => {
            setReviewSuccess(false);
            setShowReviewModal(false);
            setNewAuthor("");
            setNewTitle("");
            setNewComment("");
            setNewRating(5);
        }, 1200);
    };

    const mainImageUrl = useMemo(
        () => resolveImageUrl(product.imageFile),
        [product.imageFile],
    );

    // Provide thumbnails so the gallery matches Image 1
    const thumbnails = useMemo(() => {
        if (Array.isArray(product.images) && product.images.length > 0) {
            const list = product.images.map((img: any) =>
                typeof img === "string" ? img : img.src || mainImageUrl,
            );
            if (!list.includes(mainImageUrl)) {
                list.unshift(mainImageUrl);
            }
            return list;
        }
        return [
            mainImageUrl,
            "/images/product/productx1.png",
            "/images/product/productx2.png",
        ];
    }, [product.images, mainImageUrl]);

    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Listen to carousel slide change
    useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
        };
        carouselApi.on("select", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi]);

    // Reset carousel slide when product changes
    useEffect(() => {
        if (carouselApi) {
            carouselApi.scrollTo(0, true);
        }
        setCurrentSlide(0);
    }, [product, carouselApi]);

    // Categories & Breadcrumb
    const categoryName = useMemo(() => {
        if (Array.isArray(product.category) && product.category.length > 0) {
            return product.category[0];
        }
        if (typeof product.product_type === "string" && product.product_type) {
            return product.product_type;
        }
        return "Furniture";
    }, [product]);

    const subCategory = useMemo(() => {
        if (Array.isArray(product.category) && product.category.length > 1) {
            return product.category[1];
        }
        return "Chairs";
    }, [product]);

    // Price calculations based on selected variant if present
    const rawPrice = useMemo(() => {
        if (
            selectedVariant &&
            selectedVariant.price !== undefined &&
            selectedVariant.price !== null
        ) {
            return Number(selectedVariant.price);
        }
        return Number(product.price || 0);
    }, [selectedVariant, product.price]);

    const discountAmount =
        typeof product.discount === "number"
            ? product.discount
            : product.discount && typeof product.discount === "object"
              ? Number(product.discount.amount || 0)
              : 0;

    const hasDiscount = discountAmount > 0;
    const finalPrice = hasDiscount
        ? Math.max(0, rawPrice - discountAmount)
        : rawPrice;

    const discountPercent =
        hasDiscount && rawPrice > 0
            ? Math.round((discountAmount / rawPrice) * 100)
            : 0;

    const handleAddToCart = async () => {
        if (isAdding) return;
        setIsAdding(true);
        try {
            const variantTitle = selectedVariant
                ? selectedVariant.title === "Default Title"
                    ? "Default"
                    : selectedVariant.title
                : "Default";

            await addToCart(
                { ...product, price: finalPrice },
                quantity,
                variantTitle,
            );
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const [quickViewProduct, setQuickViewProduct] =
        useState<DisplayProduct | null>(null);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    // Prepare popular selection items (up to 10 products with same product_type)
    const displayPopularProducts = useMemo(() => {
        const list =
            popularProducts.length > 0 ? popularProducts : DEFAULT_POPULAR;
        return list.map((p, idx) => toDisplayProduct(p, idx));
    }, [popularProducts]);

    return (
        <div className="w-full">
            {/* Top Product Detail Section (Image 1 & 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
                {/* Left: 2-column Product Images Grid (as in Image 1 & 2) */}
                <div className="lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {thumbnails.map((thumb, idx) => (
                            <div
                                key={idx}
                                className={`relative w-full rounded-md shadow-md bg-[#ECECE8] dark:bg-neutral-900 overflow-hidden border  border-neutral-200/50 dark:border-neutral-800 group ${
                                    thumbnails.length === 1
                                        ? "sm:col-span-2 aspect-[4/3] sm:aspect-[16/10]"
                                        : "aspect-[4/5] sm:aspect-[3/4]"
                                }`}
                            >
                                <Image
                                    src={thumb}
                                    alt={`${product.name} view ${idx + 1}`}
                                    fill
                                    priority={idx < 2}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 35vw"
                                    className="object-cover  w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "/images/placeholder.png";
                                    }}
                                />

                                {/* On the first image (idx === 0): Badges & Wishlist button (Image 1) */}
                                {idx === 0 && (
                                    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
                                        <div className="flex flex-col gap-1 text-[10px] sm:text-xs font-normal tracking-widest uppercase text-neutral-900 dark:text-neutral-100">
                                            <span className="font-medium">
                                                BEST SELLER
                                            </span>
                                            {discountPercent > 0 ? (
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    {discountPercent}% OFF
                                                </span>
                                            ) : (
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    NEW ARRIVAL
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsFavorited(!isFavorited);
                                            }}
                                            className="w-9 h-9 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-neutral-700/80 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer shadow-xs pointer-events-auto"
                                            aria-label="Save to wishlist"
                                        >
                                            <Heart
                                                className={`w-4 h-4 transition-transform ${
                                                    isFavorited
                                                        ? "fill-rose-500 text-rose-500 scale-110"
                                                        : "stroke-[1.5] hover:scale-105"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Information (Sticky when scrolling down until next section) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start h-fit flex flex-col justify-between pr-0 lg:pr-2 z-10">
                    <div>
                        {/* Product Title (in elegant serif italic font) */}
                        <h1 className="font-serif text-center italic text-3xl sm:text-4xl lg:text-4xl font-normal text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight ">
                            {product.name}
                        </h1>
                        {/* Description (supports formatted HTML with suppressHydrationWarning) */}
                        <div
                            className="max-h-50 overflow-scroll overflow-x-hidden scrollbar-thin font-serif italic text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal mt-4 sm:mt-5 prose prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5"
                            suppressHydrationWarning
                            dangerouslySetInnerHTML={{
                                __html:
                                    product.description ||
                                    product.body_html ||
                                    "<p>A clean-lined chair in a modern minimalist style, crafted from natural wood. Its smooth silhouette, comfortable armrests, and ergonomic shape make it a practical and versatile choice for any interior. The light finish and airy design allow it to blend seamlessly into a kitchen, dining room, living space, or café.</p>",
                            }}
                        />{" "}
                        {/* Color Variants (like in Image 2) */}
                        {resolvedColorVariants.length > 1 && (
                            <div className="mt-6 ml-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    {resolvedColorVariants.map((item) => {
                                        const colorTitle =
                                            item.name || item.title || "";
                                        const lastDash =
                                            colorTitle.lastIndexOf("-");
                                        const colorName = (
                                            lastDash !== -1
                                                ? colorTitle
                                                      .substring(lastDash + 1)
                                                      .trim()
                                                : colorTitle.trim()
                                        ).toUpperCase();

                                        let thumbUrl =
                                            "/images/placeholder.png";
                                        if (
                                            item.images &&
                                            item.images.length > 0 &&
                                            item.images[0]?.src
                                        ) {
                                            thumbUrl = item.images[0].src;
                                        } else if (
                                            item.imageFile?.startsWith(
                                                "http",
                                            ) ||
                                            item.imageFile?.startsWith("/")
                                        ) {
                                            thumbUrl = item.imageFile;
                                        } else if (item.imageFile) {
                                            thumbUrl = `/images/product/${item.imageFile}`;
                                        }

                                        const isActive = item.id === product.id;

                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/products/${item.id}`}
                                                className={`group relative flex items-center gap-3 p-1.5 sm:p-2 border transition-all duration-200 cursor-pointer ${
                                                    isActive
                                                        ? "border-neutral-950 dark:border-white ring-1 ring-neutral-950 dark:ring-white bg-white dark:bg-neutral-900"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent"
                                                }`}
                                                title={colorTitle}
                                            >
                                                <div className="relative w-10 h-10 sm:w-11 sm:h-9 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                    <Image
                                                        src={thumbUrl}
                                                        alt={colorName}
                                                        fill
                                                        sizes="44px"
                                                        className="object-contain p-1"
                                                        unoptimized={thumbUrl.startsWith(
                                                            "http",
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-xs sm:text-xs font-normal tracking-widest uppercase text-neutral-900 dark:text-neutral-100 pr-3 sm:pr-4 whitespace-nowrap">
                                                    {colorName}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="mt-8 border-y border-neutral-200/90 dark:border-neutral-800 divide-y divide-neutral-200/90 dark:divide-neutral-800">
                            {/* Variant Row */}
                            <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                                <span className="font-normal text-neutral-900 dark:text-neutral-200">
                                    Variant
                                </span>
                                {variants.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-2 justify-end max-w-[70%]">
                                        {variants.map((v: any, idx: number) => {
                                            const isSelected =
                                                selectedVariant?.id === v.id ||
                                                (selectedVariant?.title &&
                                                    selectedVariant.title ===
                                                        v.title);
                                            const displayTitle =
                                                v.title === "Default Title"
                                                    ? "Default"
                                                    : v.title;
                                            return (
                                                <button
                                                    key={v.id || idx}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedVariant(v)
                                                    }
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm"
                                                            : "bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                                                    }`}
                                                >
                                                    {displayTitle}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                        Default
                                    </span>
                                )}
                            </div>

                            {/* Weight Row */}
                            <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                                <span className="font-normal text-neutral-900 dark:text-neutral-200">
                                    Weight
                                </span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {selectedVariant &&
                                    selectedVariant.grams !== undefined &&
                                    selectedVariant.grams !== null
                                        ? selectedVariant.grams >= 1000
                                            ? `${(selectedVariant.grams / 1000).toFixed(1)} kg`
                                            : `${selectedVariant.grams}g`
                                        : "—"}
                                </span>
                            </div>

                            {/* Brand Row */}
                            <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                                <span className="font-normal text-neutral-900 dark:text-neutral-200">
                                    Brand
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center p-0.5">
                                        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                                            <span className="bg-white dark:bg-neutral-900 rounded-[1px]"></span>
                                            <span className="bg-white dark:bg-neutral-900 rounded-[1px]"></span>
                                            <span className="bg-white dark:bg-neutral-900 rounded-[1px]"></span>
                                            <span className="bg-white dark:bg-neutral-900 rounded-[1px]"></span>
                                        </div>
                                    </div>
                                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {product.vendor || "Atelier M"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Controls: Quantity Selector & Add to Cart Button */}
                        <div className="flex items-center gap-4 mt-5 pb-5">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 bg-transparent h-12 px-2 rounded-sm">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity(Math.max(1, quantity - 1))
                                    }
                                    disabled={quantity <= 1 || isAdding}
                                    className="w-8 h-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 cursor-pointer text-lg font-light"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={isAdding}
                                    className="w-8 h-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer text-lg font-light"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="btn-1 flex-1 !h-12 !m-0 rounded-sm flex items-center justify-center gap-2 text-xs sm:text-sm font-medium tracking-wider cursor-pointer disabled:opacity-75"
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Added to Cart!</span>
                                    </>
                                ) : (
                                    <span>
                                        Add to cart for $
                                        {Math.round(finalPrice * quantity)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frequently Asked Questions Section */}
            <section className="mt-20 sm:mt-28 pt-12 border-t border-neutral-200/90 dark:border-neutral-800">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* Left: Section Title */}
                    <div className="lg:col-span-4">
                        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-4xl font-normal text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
                            Frequently asked questions
                        </h2>
                    </div>

                    {/* Right: Accordion */}
                    <div className="lg:col-span-8">
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="faq-1"
                            className="w-full divide-y divide-neutral-200/90 dark:divide-neutral-800 border-b border-neutral-200/90 dark:border-neutral-800"
                        >
                            <AccordionItem value="faq-1" className="border-b-0">
                                <AccordionTrigger className="text-left text-xs sm:text-sm font-normal tracking-wider uppercase text-neutral-900 dark:text-neutral-100 hover:no-underline py-5">
                                    HOW CAN I MAKE MY NECKLACE OR BRACELET
                                    LONGER?
                                </AccordionTrigger>
                                <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pb-6 space-y-3">
                                    <p>
                                        If you would like to make your chain
                                        styles longer, we would suggest
                                        purchasing our{" "}
                                        <span className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer">
                                            Chain Extender
                                        </span>{" "}
                                        available in both gold and silver.
                                    </p>
                                    <p>
                                        This allows you to increase the length
                                        of your necklaces or bracelets by up to
                                        5cm.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="faq-2" className="border-b-0">
                                <AccordionTrigger className="text-left text-xs sm:text-sm font-normal tracking-wider uppercase text-neutral-900 dark:text-neutral-100 hover:no-underline py-5">
                                    DO YOU OFFER GIFT WRAPPING?
                                </AccordionTrigger>
                                <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pb-6">
                                    <p>
                                        Yes, each item arrives in our signature
                                        branded jewellery pouch or gift box. You
                                        may also select complimentary gift
                                        wrapping and add a handwritten
                                        personalized gift message during
                                        checkout.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="faq-3" className="border-b-0">
                                <AccordionTrigger className="text-left text-xs sm:text-sm font-normal tracking-wider uppercase text-neutral-900 dark:text-neutral-100 hover:no-underline py-5">
                                    HOW CAN I MAINTAIN THE QUALITY OF MY
                                    JEWELLERY?
                                </AccordionTrigger>
                                <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pb-6 space-y-3">
                                    <p>
                                        To maintain its original lustre, we
                                        recommend keeping jewellery away from
                                        water, lotions, perfumes, and chemical
                                        cleaners.
                                    </p>
                                    <p>
                                        Remove before swimming, bathing,
                                        exercising, or sleeping, and store
                                        inside an airtight container or your
                                        branded pouch.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {showAllFaqs && (
                                <>
                                    <AccordionItem
                                        value="faq-4"
                                        className="border-b-0"
                                    >
                                        <AccordionTrigger className="text-left text-xs sm:text-sm font-normal tracking-wider uppercase text-neutral-900 dark:text-neutral-100 hover:no-underline py-5">
                                            WHAT IS YOUR WARRANTY POLICY?
                                        </AccordionTrigger>
                                        <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pb-6">
                                            <p>
                                                We offer a 6-month warranty on
                                                all pieces covering
                                                manufacturing defects. Please
                                                keep your order confirmation
                                                number for proof of purchase.
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem
                                        value="faq-5"
                                        className="border-b-0"
                                    >
                                        <AccordionTrigger className="text-left text-xs sm:text-sm font-normal tracking-wider uppercase text-neutral-900 dark:text-neutral-100 hover:no-underline py-5">
                                            WHAT ARE YOUR SHIPPING TIMEFRAMES?
                                        </AccordionTrigger>
                                        <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pb-6">
                                            <p>
                                                Orders are dispatched within 1-2
                                                business days. Standard shipping
                                                takes 3-5 business days, and
                                                Express courier delivery takes
                                                1-2 business days.
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </>
                            )}
                        </Accordion>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={() => setShowAllFaqs((prev) => !prev)}
                                className="px-8 py-3 border border-neutral-900 dark:border-neutral-100 text-xs font-normal tracking-widest uppercase text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900 transition-colors cursor-pointer"
                            >
                                {showAllFaqs ? "SHOW LESS" : "READ MORE"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="mt-20 sm:mt-28 pt-12 border-t border-neutral-200/90 dark:border-neutral-800">
                <div className="flex items-baseline justify-between mb-8">
                    <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-4xl font-normal text-neutral-900 dark:text-neutral-50 tracking-tight">
                        Customer reviews
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="text-xs font-normal tracking-widest uppercase text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
                    >
                        WRITE A REVIEW
                    </button>
                </div>

                {reviews.length === 0 ? (
                    <div className="border-t border-neutral-200/90 dark:border-neutral-800 py-16 sm:py-20 flex flex-col items-center justify-center text-center">
                        <p className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400">
                            There are no reviews yet.
                        </p>
                    </div>
                ) : (
                    <div className="border-t border-neutral-200/90 dark:border-neutral-800 divide-y divide-neutral-200/90 dark:divide-neutral-800">
                        {reviews.map((rev) => (
                            <div key={rev.id} className="py-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${
                                                    i < rev.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-neutral-300 dark:text-neutral-700"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-neutral-400">
                                        {rev.date}
                                    </span>
                                </div>
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {rev.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {rev.comment}
                                </p>
                                <span className="text-xs text-neutral-400 italic block">
                                    — {rev.author}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Write a Review Dialog */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="font-serif italic text-2xl font-normal text-neutral-900 dark:text-neutral-100">
                            Write a review
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                            Share your thoughts on{" "}
                            {product.name || product.title} with other
                            customers.
                        </DialogDescription>
                    </DialogHeader>

                    {reviewSuccess ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                Thank you for your review!
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleAddReview}
                            className="space-y-4 pt-2"
                        >
                            <div>
                                <label className="block text-xs font-normal tracking-wider uppercase text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    Rating
                                </label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            className="p-1 cursor-pointer focus:outline-none"
                                        >
                                            <Star
                                                className={`w-5 h-5 ${
                                                    star <= newRating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-neutral-300 dark:text-neutral-600"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-normal tracking-wider uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAuthor}
                                    onChange={(e) =>
                                        setNewAuthor(e.target.value)
                                    }
                                    placeholder="e.g. Sarah M."
                                    className="w-full text-xs px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-normal tracking-wider uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                                    Review Title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) =>
                                        setNewTitle(e.target.value)
                                    }
                                    placeholder="e.g. Stunning everyday piece"
                                    className="w-full text-xs px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-normal tracking-wider uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                                    Review *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="Write your review here..."
                                    className="w-full text-xs px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-4 py-2 text-xs font-normal tracking-wider uppercase border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-xs font-normal tracking-wider uppercase bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            <section className="mt-20 pt-10 border-t border-neutral-200/90 dark:border-neutral-800">
                <div className="flex items-baseline justify-between mb-8">
                    <h2 className="font-serif italic text-3xl sm:text-4xl font-normal text-neutral-900 dark:text-neutral-50">
                        Popular Selection
                    </h2>
                    <div className="flex items-center text-xs sm:text-sm font-serif italic text-neutral-400 dark:text-neutral-500 gap-1.5">
                        <Link
                            href="/products"
                            className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                        >
                            Catalog
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/products?category=${encodeURIComponent(categoryName)}`}
                            className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                        >
                            {categoryName}
                        </Link>
                        <span>/</span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                            {subCategory}
                        </span>
                    </div>
                </div>

                {/* Popular Products Carousel */}
                <div className="relative px-1 sm:px-4">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: displayPopularProducts.length > 4,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-3 sm:-ml-4">
                            {displayPopularProducts.map((p) => (
                                <CarouselItem
                                    key={p.id}
                                    className="pl-3 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                >
                                    <ProductCard
                                        product={p}
                                        onQuickView={(prod) => {
                                            setQuickViewProduct(prod);
                                            setQuickViewOpen(true);
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {displayPopularProducts.length > 1 && (
                            <>
                                <CarouselPrevious className="-left-3 sm:-left-5 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 shadow-md border-neutral-200 dark:border-neutral-700 h-9 w-9 cursor-pointer" />
                                <CarouselNext className="-right-3 sm:-right-5 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 shadow-md border-neutral-200 dark:border-neutral-700 h-9 w-9 cursor-pointer" />
                            </>
                        )}
                    </Carousel>
                </div>

                {/* Quick View Dialog */}
                <ProductQuickViewDialog
                    open={quickViewOpen}
                    onOpenChange={setQuickViewOpen}
                    product={quickViewProduct}
                />
            </section>
        </div>
    );
}

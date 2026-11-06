import { z } from "zod";

export const productFilterSchema = z.object({
    categories: z.array(z.string()).default([]),
    skinTypes: z.array(z.string()).default([]),
    minPrice: z.number().min(0).default(10),
    maxPrice: z.number().min(0).default(100),
    ratings: z.array(z.number()).default([]),
    promotions: z.array(z.string()).default([]),
    availability: z.array(z.string()).default([]),
    sortBy: z
        .enum([
            "default",
            "bestseller",
            "rating",
            "newest",
            "price-low",
            "price-high",
        ])
        .default("default"),
    search: z.string().optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).default(12),
});

export type ProductFilterFormValues = z.infer<typeof productFilterSchema>;

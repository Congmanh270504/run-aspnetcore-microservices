import { z } from "zod";

export const couponSchema = z
    .object({
        productName: z.string().min(1, "Product name is required"),
        description: z.string().min(1, "Description is required"),
        amount: z.number().min(0, "Amount must be greater than or equal to 0"),
        startDate: z.date({ message: "Start date is required" }),
        endDate: z.date({ message: "End date is required" }),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "End date must be on or after start date",
        path: ["endDate"],
    });

export type CouponFormValues = z.infer<typeof couponSchema>;



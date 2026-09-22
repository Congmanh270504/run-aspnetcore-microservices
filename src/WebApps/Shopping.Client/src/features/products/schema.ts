import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    categoriesStr: z.string().min(1, "At least one category is required"),
    price: z.coerce.number().min(0.01, "Price must be greater than 0"),
    imageFile: z.string().min(1, "Please select an image"),
    description: z.string().min(1, "Description is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

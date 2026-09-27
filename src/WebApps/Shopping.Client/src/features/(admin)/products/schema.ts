import { z } from "zod";

export const variantSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Vui lòng nhập tên biến thể"),
    price: z.coerce.number().min(0, "Giá biến thể phải >= 0"),
    grams: z.coerce.number().optional(),
    sku: z.string().optional(),
    featured_image: z.string().optional(),
});

export const productSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
    product_type: z.string().optional(),
    category: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 danh mục"),
    price: z.coerce.number().optional(),
    images: z.array(z.string()).optional(),
    imageFile: z.string().optional(),
    description: z.string().min(1, "Vui lòng nhập mô tả chi tiết"),
    variants: z.array(variantSchema).min(1, "Vui lòng thêm ít nhất 1 biến thể"),
});

export type VariantFormValues = z.infer<typeof variantSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;

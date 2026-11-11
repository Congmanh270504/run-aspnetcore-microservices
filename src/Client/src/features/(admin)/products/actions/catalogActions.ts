"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import { 
  Product, 
  GetProductsResponse, 
  GetProductByIdResponse, 
  GetProductByCategoryResponse,
  CreateProductData,
  UpdateProductData
} from "@/types";
import { revalidatePath } from "next/cache";

export async function getProducts(pageNumber: number = 1, pageSize: number = 50): Promise<Product[]> {
  const gatewayResult = await fetchFromGateway<GetProductsResponse>(
    `/catalog-service/products?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return gatewayResult?.products || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const gatewayResult = await fetchFromGateway<GetProductByIdResponse>(
    `/catalog-service/products/${id}`
  );
  return gatewayResult?.product || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const gatewayResult = await fetchFromGateway<GetProductByCategoryResponse>(
    `/catalog-service/products/category/${encodeURIComponent(category)}`
  );
  return gatewayResult?.products || [];
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const gatewayRes = await fetchFromGateway<{ categories: { name: string }[] }>(
      "/catalog-service/categories"
    );
    if (gatewayRes?.categories && gatewayRes.categories.length > 0) {
      return gatewayRes.categories.map((c) => c.name);
    }
  } catch {
    // Fallback to reading from products
  }

  const products = await getProducts(1, 100);
  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    p.category?.forEach((c) => categoriesSet.add(c));
  });
  return Array.from(categoriesSet);
}

export async function createProduct(data: CreateProductData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetchFromGateway<{ id: string }>(`/catalog-service/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res?.id) {
      revalidatePath("/products");
      revalidatePath("/admin/products");
      revalidatePath("/");
      return { success: true, id: res.id };
    }

    return { success: false, error: "Failed to create product" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Error creating product" };
  }
}

export async function updateProduct(data: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchFromGateway<{ isSuccess: boolean }>(`/catalog-service/products`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (res?.isSuccess) {
      revalidatePath("/products");
      revalidatePath(`/products/${data.id}`);
      revalidatePath("/admin/products");
      revalidatePath("/");
      return { success: true };
    }

    return { success: false, error: "Failed to update product" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Error updating product" };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchFromGateway<{ isSuccess: boolean }>(`/catalog-service/products/${id}`, {
      method: "DELETE",
    });

    if (res?.isSuccess) {
      revalidatePath("/products");
      revalidatePath("/admin/products");
      revalidatePath("/");
      return { success: true };
    }

    return { success: false, error: "Failed to delete product" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Error deleting product" };
  }
}

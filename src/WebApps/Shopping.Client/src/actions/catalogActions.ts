"use server";

import { fetchFromGateway, fetchDirect } from "@/lib/gatewayClient";
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
  // 1. Try Yarp Gateway first
  const gatewayResult = await fetchFromGateway<GetProductsResponse>(
    `/catalog-service/products?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  if (gatewayResult?.products && gatewayResult.products.length > 0) {
    return gatewayResult.products;
  }

  // 2. Fallback to direct Catalog.API
  const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";
  const directResult = await fetchDirect<GetProductsResponse>(
    catalogUrl,
    `/products?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return directResult?.products || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const gatewayResult = await fetchFromGateway<GetProductByIdResponse>(
    `/catalog-service/products/${id}`
  );
  if (gatewayResult?.product) {
    return gatewayResult.product;
  }

  const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";
  const directResult = await fetchDirect<GetProductByIdResponse>(
    catalogUrl,
    `/products/${id}`
  );
  return directResult?.product || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const gatewayResult = await fetchFromGateway<GetProductByCategoryResponse>(
    `/catalog-service/products/category/${encodeURIComponent(category)}`
  );
  if (gatewayResult?.products && gatewayResult.products.length > 0) {
    return gatewayResult.products;
  }

  const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";
  const directResult = await fetchDirect<GetProductByCategoryResponse>(
    catalogUrl,
    `/products/category/${encodeURIComponent(category)}`
  );
  return directResult?.products || [];
}

export async function getAllCategories(): Promise<string[]> {
  const products = await getProducts(1, 100);
  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    p.category?.forEach((c) => categoriesSet.add(c));
  });
  return Array.from(categoriesSet);
}

export async function createProduct(data: CreateProductData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";
    
    // Try gateway first
    let res = await fetchFromGateway<{ id: string }>(`/catalog-service/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Fallback direct
    if (!res) {
      res = await fetchDirect<{ id: string }>(catalogUrl, `/products`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

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
    const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";

    // Try gateway first
    let res = await fetchFromGateway<{ isSuccess: boolean }>(`/catalog-service/products`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    // Fallback direct
    if (!res) {
      res = await fetchDirect<{ isSuccess: boolean }>(catalogUrl, `/products`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }

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
    const catalogUrl = process.env.CATALOG_API_URL || "http://localhost:56258";

    // Try gateway first
    let res = await fetchFromGateway<{ isSuccess: boolean }>(`/catalog-service/products/${id}`, {
      method: "DELETE",
    });

    // Fallback direct
    if (!res) {
      res = await fetchDirect<{ isSuccess: boolean }>(catalogUrl, `/products/${id}`, {
        method: "DELETE",
      });
    }

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


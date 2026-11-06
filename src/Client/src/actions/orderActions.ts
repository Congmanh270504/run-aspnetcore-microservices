"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import { Order, GetOrdersResponse } from "@/types";

interface GetOrdersByCustomerResponse {
  orders: Order[];
}

export async function getOrders(pageIndex: number = 0, pageSize: number = 50): Promise<Order[]> {
  // Ordering.API uses 0-based indexing for pageIndex (page 0 is first page)
  const normalizedIndex = pageIndex > 0 ? pageIndex - 1 : 0;
  const result = await fetchFromGateway<GetOrdersResponse>(
    `/ordering-service/orders?pageIndex=${normalizedIndex}&pageSize=${pageSize}`
  );
  return result?.orders?.data || [];
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const result = await fetchFromGateway<GetOrdersByCustomerResponse>(
    `/ordering-service/orders/customer/${customerId}`
  );
  return result?.orders || [];
}


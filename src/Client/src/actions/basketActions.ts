"use server";

import { fetchFromGateway } from "@/lib/gatewayClient";
import { 
  ShoppingCart, 
  ShoppingCartItem, 
  BasketCheckoutData, 
  Product 
} from "@/types";
import { revalidatePath } from "next/cache";
import { toValidGuid } from "@/lib/utils";

const DEFAULT_USER = "swn";

interface GetBasketResponse {
  cart: ShoppingCart;
}

interface StoreBasketResponse {
  userName: string;
}

interface DeleteBasketResponse {
  isSuccess: boolean;
}

interface CheckoutBasketResponse {
  isSuccess: boolean;
}

export async function getBasket(userName: string = DEFAULT_USER): Promise<ShoppingCart> {
  const result = await fetchFromGateway<GetBasketResponse>(
    `/basket-service/basket/${userName}`
  );

  if (!result || !result.cart) {
    return {
      userName,
      items: [],
      totalPrice: 0,
    };
  }

  const items = result.cart.items || [];
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    ...result.cart,
    items,
    totalPrice,
  };
}

export async function storeBasket(cart: ShoppingCart): Promise<boolean> {
  const result = await fetchFromGateway<StoreBasketResponse>(
    `/basket-service/basket`,
    {
      method: "POST",
      body: JSON.stringify({ cart }),
    }
  );

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return !!result;
}

export async function addToBasket(
  product: Product,
  quantity: number = 1,
  color: string = "Black",
  userName: string = DEFAULT_USER
): Promise<ShoppingCart> {
  const currentBasket = await getBasket(userName);
  const items = [...currentBasket.items];
  const existingIndex = items.findIndex((i) => i.productId === product.id && i.color === color);

  if (existingIndex > -1) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      color,
    });
  }

  const updatedBasket: ShoppingCart = {
    userName,
    items,
  };

  await storeBasket(updatedBasket);
  return await getBasket(userName);
}

export async function updateItemQuantity(
  productId: string,
  quantity: number,
  userName: string = DEFAULT_USER
): Promise<ShoppingCart> {
  const currentBasket = await getBasket(userName);
  let items = [...currentBasket.items];

  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    items = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
  }

  const updatedBasket: ShoppingCart = {
    userName,
    items,
  };

  await storeBasket(updatedBasket);
  return await getBasket(userName);
}

export async function removeFromBasket(
  productId: string,
  userName: string = DEFAULT_USER
): Promise<ShoppingCart> {
  return await updateItemQuantity(productId, 0, userName);
}

export async function deleteBasket(userName: string = DEFAULT_USER): Promise<boolean> {
  const result = await fetchFromGateway<DeleteBasketResponse>(
    `/basket-service/basket/${userName}`,
    {
      method: "DELETE",
    }
  );

  revalidatePath("/cart");
  return result?.isSuccess ?? true;
}

export async function checkoutBasket(
  checkoutData: Omit<BasketCheckoutData, "userName" | "customerId"> & { customerId?: string },
  userName: string = DEFAULT_USER
): Promise<{ success: boolean; message?: string }> {
  try {
    const currentBasket = await getBasket(userName);
    if (!currentBasket.items || currentBasket.items.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    const resolvedCustomerId = checkoutData.customerId
      ? toValidGuid(checkoutData.customerId)
      : "58c49479-ec65-4de2-86e7-033c546291aa"; // Default seeded customer

    const fullPayload: BasketCheckoutData = {
      ...checkoutData,
      userName,
      customerId: resolvedCustomerId,
      totalPrice: currentBasket.totalPrice || 0,
    };

    const result = await fetchFromGateway<CheckoutBasketResponse>(
      `/basket-service/basket/checkout`,
      {
        method: "POST",
        body: JSON.stringify({ basketCheckoutDto: fullPayload }),
      }
    );

    if (result && result.isSuccess) {
      revalidatePath("/cart");
      revalidatePath("/orders");
      return { success: true };
    }

    return { success: false, message: "Checkout failed. Please try again." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred during checkout";
    return { success: false, message: msg };
  }
}


export interface Product {
    id: string;
    name: string;
    category: string[];
    description: string;
    imageFile: string;
    price: number;
    title?: string;
    handle?: string;
    body_html?: string;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    vendor?: string;
    product_type?: string;
    tags?: string[];
    variants?: any[];
    images?: any[];
    options?: any[];
}

export interface GetProductsResponse {
    products: Product[];
}

export interface GetProductByIdResponse {
    product: Product;
}

export interface GetProductByCategoryResponse {
    products: Product[];
}

export interface ShoppingCartItem {
    quantity: number;
    color: string;
    price: number;
    productId: string;
    productName: string;
}

export interface ShoppingCart {
    userName: string;
    items: ShoppingCartItem[];
    totalPrice?: number;
}

export interface BasketCheckoutData {
    userName: string;
    customerId: string;
    totalPrice: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    addressLine: string;
    country: string;
    state: string;
    zipCode: string;
    cardName: string;
    cardNumber: string;
    expiration: string;
    cvv: string;
    paymentMethod: number;
}

export interface Address {
    firstName: string;
    lastName: string;
    emailAddress: string;
    addressLine: string;
    country: string;
    state: string;
    zipCode: string;
}

export interface Payment {
    cardName: string;
    cardNumber: string;
    expiration: string;
    cvv: string;
    paymentMethod: number;
}

export interface OrderItem {
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
}

export enum OrderStatus {
    Draft = 1,
    Pending = 2,
    Completed = 3,
    Cancelled = 4,
}

export interface Order {
    id: string;
    customerId: string;
    orderName: string;
    shippingAddress: Address;
    billingAddress: Address;
    payment: Payment;
    status: OrderStatus;
    orderItems: OrderItem[];
}

export interface PaginatedResult<T> {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: T[];
}

export interface GetOrdersResponse {
    orders: PaginatedResult<Order>;
}

export interface CreateProductData {
    name: string;
    category: string[];
    description: string;
    imageFile: string;
    price: number;
}

export interface UpdateProductData extends CreateProductData {
    id: string;
}

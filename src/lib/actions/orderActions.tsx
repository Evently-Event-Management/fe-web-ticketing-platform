import { apiFetch } from "@/lib/api";
import {ApiOrder, CreateOrderRequest, CreateOrderResponse, Order} from "@/types/order";
import { OrderDetailsResponse } from "./analyticsActions";

const API_BASE_PATH = '/order';

export const createOrder = (order: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return apiFetch<CreateOrderResponse>(`${API_BASE_PATH}`, {
        method: 'POST',
        body: JSON.stringify(order),
    });
};
export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    order: OrderDetailsResponse;
    seatLockDurationMins: number;
}


export const createPaymentIntent = (orderId: string): Promise<PaymentIntentResponse> => {
    return apiFetch<PaymentIntentResponse>(`${API_BASE_PATH}/${orderId}/create-payment-intent`, {
        method: 'POST',
    });
}

export const fetchOrderById = (orderId: string): Promise<Order> => {
    return apiFetch<Order>(`${API_BASE_PATH}/${orderId}`, {
        method: 'GET',
    });
};

export const fetchUserOrders = (): Promise<Order[]> => {
    return apiFetch<Order[]>(`${API_BASE_PATH}/user/orders`, {
        method: 'GET',
    });
};

export const fetchOrdersByUserId = (userId: string): Promise<ApiOrder[]> => {
    return apiFetch<ApiOrder[]>(`${API_BASE_PATH}/user/${userId}`, {
        method: 'GET',
    });
};

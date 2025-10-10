import { apiFetch } from "@/lib/api";
import { CreateOrderRequest, CreateOrderResponse } from "@/types/order";
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
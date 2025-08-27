import {apiFetch} from "@/lib/api";
import {CreateOrderRequest, CreateOrderResponse} from "@/types/order";

const API_BASE_PATH = '/order/v1/events';

export const createOrder = (order: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return apiFetch<CreateOrderResponse>(API_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(order),
    });
};
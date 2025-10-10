import {apiFetch} from "@/lib/api";
import {CreateOrderRequest, CreateOrderResponse, Order, PaymentRequest, PaymentResponse, ApiOrder} from "@/types/order";

const API_BASE_PATH = '/order';
const PAYMENT_API_PATH = '/order/payment/process';

export const createOrder = (order: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return apiFetch<CreateOrderResponse>(`${API_BASE_PATH}`, {
        method: 'POST',
        body: JSON.stringify(order),
    });
};

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

export const processPayment = async (orderId: string): Promise<PaymentResponse> => {
    // Create payment request with fixed values except for order_id
    const paymentRequest: PaymentRequest = {
        order_id: orderId,
        currency: "lkr",
        description: "Test payment",
        token: "pm_card_visa"
    };
    
    console.log('Sending payment request:', paymentRequest);
    
    const response = await apiFetch<PaymentResponse>(`${PAYMENT_API_PATH}`, {
        method: 'POST',
        body: JSON.stringify(paymentRequest),
    });
    
    console.log('Payment response received:', response);
    
    return response;
};


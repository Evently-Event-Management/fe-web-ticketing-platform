export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface CreateOrderRequest {
    event_id: string;
    session_id: string;
    seat_ids: string[];
    discountCode?: string;
}

export interface CreateOrderResponse {
    order_id: string;
    session_id: string;
    seat_ids: string[];
    user_id: string;
}

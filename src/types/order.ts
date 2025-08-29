export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface CreateOrderRequest {
    eventId: string;
    session_id: string;
    seat_ids: string[];
    discountCode?: string;
}

export interface CreateOrderResponse {
    orderId: string; // UUID
    status: OrderStatus;
    expiresAt: string; // ISO 8601 format
    totalPrice: number; // Use number for price
}

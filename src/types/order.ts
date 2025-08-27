export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface CreateOrderRequest {
    eventID: string;
    sessionId: string;
    seatIds: string[];
    discountCode?: string;
}

export interface CreateOrderResponse {
    orderId: string; // UUID
    status: OrderStatus;
    expiresAt: string; // ISO 8601 format
    totalPrice: number; // Use number for price
}

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
    discount_id: string | null;
}

export interface CreateOrderResponse {
    order_id: string;
    session_id: string;
    seat_ids: string[];
    user_id: string;
}

export interface TicketResponse {
    ticket_id: string;
    order_id: string;
    seat_id: string;
    seat_label: string;
    colour: string;
    tier_id: string;
    tier_name: string;
    price_at_purchase: number;
    issued_at: string;
    checked_in: boolean;
    checked_in_time: string; // always present, even if "0001-01-01T00:00:00Z"
}

export interface OrderDetailsResponse {
    OrderID: string;
    UserID: string;
    EventID: string;
    SessionID: string;
    Status: 'pending' | 'completed' | 'cancelled';
    SubTotal: number;
    DiscountID: string;
    DiscountCode: string;
    DiscountAmount: number;
    Price: number;
    CreatedAt: string;
    TotalCount?: number; // Total count for pagination
    tickets: TicketResponse[];
}

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface CreateOrderRequest {
    event_id: string;
    session_id: string;
    organization_id: string;
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

export interface ApiTicket {
    ticket_id: string;
    order_id: string;
    seat_id: string;
    seat_label: string;
    colour: string;
    tier_id: string;
    tier_name: string;
    qr_code: string; // Base64 encoded QR code data
    price_at_purchase: number;
    issued_at: string;
    checked_in: boolean;
    checked_in_time: string;
}

export interface ApiOrder {
    OrderID: string;
    UserID: string;
    EventID: string;
    SessionID: string;
    Status: string;
    SubTotal: number;
    DiscountID?: string;
    DiscountCode?: string;
    DiscountAmount?: number;
    Price: number;
    CreatedAt: string;
    tickets: ApiTicket[];
}


export interface Order {
    OrderID: string;
    UserID: string;
    SessionID: string;
    SeatIDs: string[];
    Status: string;
    Price: number;
    CreatedAt: string;
    EventID?: string; // May be included in future responses
    UpdatedAt?: string;
    DiscountID?: string;
    PaymentID?: string;
}

export enum TicketStatus {
    VALID = "VALID",
    USED = "USED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface Ticket {
    TicketID: string;
    OrderID: string;
    SeatID: string;
    EventID: string;
    SessionID: string;
    QRCode: string;
    Status: TicketStatus;
    IssuedAt: string;
    ValidUntil: string;
    EventName?: string;
    VenueName?: string;
    SessionDate?: string;
    SessionTime?: string;
    SeatRow?: string;
    SeatNumber?: string;
    TicketType?: string;
    Price: number;
}
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
    OrderID: string;
    SessionID: string;
    SeatIDs: string[];
    UserID: string;
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

export interface PaymentRequest {
    order_id: string;
    currency: string;
    description: string;
    token: string;
}

export interface PaymentRecord {
    payment_id: string;
    order_id: string;
    status: string;
    price: number;
    created_date: string;
    url: string;
    transaction_id: string;
    updated_date: string;
}

export interface StripeResult {
    payment_id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    transaction_id: string;
    payment_method: string;
    receipt_url: string;
    created: number;
}

export interface PaymentResponse {
    data: {
        payment_record: PaymentRecord;
        stripe_result: StripeResult;
    };
    message: string;
    status: string;
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

export enum TicketStatus {
    VALID = "VALID",
    USED = "USED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export interface OrderWithTickets extends Order {
    Tickets: Ticket[];
}

// New API response types
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
    PaymentAT?: string;
    tickets: ApiTicket[];
}

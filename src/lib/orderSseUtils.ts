import {OrderCheckoutSseEvent, TicketForStreaming} from "@/types/order";

export interface ParsedOrderCheckoutEvent {
    orderId?: string;
    revenue: number;
    ticketCount: number;
}

const ORDER_ID_KEYS = [
    "order_id",
    "orderId",
    "OrderID",
    "OrderId",
    "id",
    "ID",
];

const ORDER_REVENUE_KEYS = [
    "total",
    "Total",
    "total_amount",
    "totalAmount",
    "amount",
    "Amount",
    "price",
    "Price",
];

const toNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const getTicketsFromPayload = (payload: OrderCheckoutSseEvent): TicketForStreaming[] => {
    const tickets = payload?.tickets ?? (payload?.Tickets as unknown);
    if (!Array.isArray(tickets)) {
        return [];
    }
    return tickets as TicketForStreaming[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const getOrderIdFromObject = (record: unknown): string | undefined => {
    if (!isRecord(record)) {
        return undefined;
    }
    for (const key of ORDER_ID_KEYS) {
        const value = record[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }
    }
    return undefined;
};

const getOrderRevenueFromObject = (record: unknown): number => {
    if (!isRecord(record)) {
        return 0;
    }
    for (const key of ORDER_REVENUE_KEYS) {
        const value = record[key];
        const numeric = toNumber(value);
        if (numeric > 0) {
            return numeric;
        }
    }
    return 0;
};

export const parseOrderCheckoutEvent = (payload: OrderCheckoutSseEvent): ParsedOrderCheckoutEvent => {
    const tickets = getTicketsFromPayload(payload);
    const ticketRevenue = tickets.reduce((total, ticket) => total + toNumber(ticket.price_at_purchase), 0);
    const fallbackRevenue = getOrderRevenueFromObject(payload);
    const embeddedOrder = (payload?.order ?? payload?.Order);
    const embeddedRevenue = getOrderRevenueFromObject(embeddedOrder);

    const orderId =
        getOrderIdFromObject(payload) ??
        getOrderIdFromObject(embeddedOrder);

    const revenue = ticketRevenue > 0 ? ticketRevenue : (embeddedRevenue > 0 ? embeddedRevenue : fallbackRevenue);

    return {
        orderId,
        revenue,
        ticketCount: tickets.length,
    };
};

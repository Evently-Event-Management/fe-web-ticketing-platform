import type { EventAnalytics as EventQueryAnalytics, SessionAnalytics as EventQuerySessionAnalytics, SessionSummary as EventSessionSummary } from '@/types/eventAnalytics';
import { apiFetch } from '@/lib/api';

// Types for order analytics responses
export interface DailySalesMetrics {
    date: string;
    revenue: number;
    tickets_sold: number;
}

export interface DiscountUsage {
    date: string;
    discount_code: string;
    usage_count: number;
    total_discount_amount: number;
}

export interface SessionSummary {
    session_id: string;
    total_revenue: number;
    total_before_discounts: number;
    total_tickets_sold: number;
}


export interface SessionSummaryResponse {
    event_id: string;
    sessions: SessionSummary[];
}

export interface TierSalesMetrics {
    tier_id: string;
    tier_name: string;
    tier_color: string;
    tickets_sold: number;
    revenue: number;
}

export interface EventOrderAnalytics {
    event_id: string;
    total_revenue: number;
    total_before_discounts: number;
    total_tickets_sold: number;
    daily_sales: DailySalesMetrics[];
    sales_by_tier: TierSalesMetrics[];
}

export interface EventOrderAnalyticsBatchResponse {
    event_ids: string[];
    total_revenue: number;
    total_before_discounts: number;
    total_tickets_sold: number;
    daily_sales: DailySalesMetrics[];
    sales_by_tier: TierSalesMetrics[];
}

// Response type for /order/analytics/events/batch/individual
export interface EventOrderAnalyticsBatchIndividualResponse {
    eventAnalytics: {
        [eventId: string]: EventOrderAnalytics;
    };
}

export interface EventDiscountAnalytics {
    event_id: string;
    discount_usage: DiscountUsage[];
}

export interface SessionOrderAnalytics {
    event_id: string;
    session_id: string;
    total_revenue: number;
    total_before_discounts: number;
    total_tickets_sold: number;
    daily_sales: DailySalesMetrics[];
    sales_by_tier: TierSalesMetrics[];
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
// API endpoints
const ORDER_API_PATH = '/order/analytics';
const ANALYTICS_API_PATH = '/event-query/v1/analytics';

/**
 * Fetches comprehensive analytics for a specific event
 * @param eventId - The ID of the event to fetch analytics for
 * @returns Promise with event analytics data
 */
export const getEventAnalytics = async (eventId: string): Promise<EventQueryAnalytics> => {
    return await apiFetch<EventQueryAnalytics>(`${ANALYTICS_API_PATH}/events/${eventId}`);
};

/**
 * Fetches basic analytics for all sessions in an event
 * @param eventId - The ID of the event to fetch session analytics for
 * @returns Promise with an array of session summary data
 */
export const getAllSessionsAnalytics = async (eventId: string): Promise<EventSessionSummary[]> => {
    return await apiFetch<EventSessionSummary[]>(`${ANALYTICS_API_PATH}/events/${eventId}/sessions`);
};

/**
 * Fetches detailed analytics for a specific session from the event-query service
 * @param eventId - The ID of the event the session belongs to
 * @param sessionId - The ID of the session to fetch analytics for
 * @returns Promise with detailed session analytics data
 */
export const getSessionAnalytics = async (eventId: string, sessionId: string): Promise<EventQuerySessionAnalytics> => {
    return await apiFetch<EventQuerySessionAnalytics>(`${ANALYTICS_API_PATH}/events/${eventId}/sessions/${sessionId}`);
};

/**
 * Retrieves revenue analytics data for an entire event from order service
 * 
 * @param eventId The ID of the event
 * @returns Event revenue analytics including total revenue, tickets sold, and daily sales
 */
export const getEventRevenueAnalytics = async (eventId: string): Promise<EventOrderAnalytics> => {
    return await apiFetch<EventOrderAnalytics>(`${ORDER_API_PATH}/events/${eventId}`);
};


/**
 * Retrieves revenue analytics data for multiple events in a single batch request
 * 
 * @param eventIds Array of event IDs to fetch analytics for
 * @returns Combined analytics for all requested events including event_ids, aggregated revenue, 
 *          aggregated ticket sales, and sales breakdowns by day and tier
 */
export const getEventOrderAnalyticsBatch = async (eventIds: string[]): Promise<EventOrderAnalyticsBatchResponse> => {
    const requestBody = {
        eventIds: eventIds
    };
    
    return await apiFetch<EventOrderAnalyticsBatchResponse>(
        `${ORDER_API_PATH}/events/batch`,
        {
            method: 'POST',
            body: JSON.stringify(requestBody)
        }
    );
};

/**
 * Retrieves individual analytics for multiple events in a single batch request
 * Each event's analytics are returned separately in an object keyed by eventId
 *
 * @param eventIds Array of event IDs to fetch analytics for
 * @returns Object with eventAnalytics mapping eventId to EventOrderAnalytics
 */
export const getEventOrderAnalyticsBatchIndividual = async (eventIds: string[]): Promise<EventOrderAnalyticsBatchIndividualResponse> => {
    const requestBody = {
        eventIds: eventIds
    };
    return await apiFetch<EventOrderAnalyticsBatchIndividualResponse>(
        `${ORDER_API_PATH}/events/batch/individual`,
        {
            method: 'POST',
            body: JSON.stringify(requestBody)
        }
    );
};

/**
 * Retrieves discount usage data for an event
 * 
 * @param eventId The ID of the event
 * @returns Discount usage statistics including usage counts and amounts by date
 */
export const getEventDiscountAnalytics = async (eventId: string): Promise<EventDiscountAnalytics> => {
    return await apiFetch<EventDiscountAnalytics>(`${ORDER_API_PATH}/events/${eventId}/discounts`);
};

/**
 * Retrieves revenue analytics data for a specific session within an event from order service
 * 
 * @param eventId The ID of the event
 * @param sessionId The ID of the session
 * @returns Session revenue analytics including total revenue, tickets sold, and daily sales
 */
export const getSessionRevenueAnalytics = async (eventId: string, sessionId: string): Promise<SessionOrderAnalytics> => {
    return await apiFetch<SessionOrderAnalytics>(`${ORDER_API_PATH}/events/${eventId}/sessions/${sessionId}`);
};

/**
 * Retrieves summary analytics data for all sessions in an event from order service
 * 
 * @param eventId The ID of the event
 * @returns Array of session summary data including revenue and tickets sold
 */
export const getSessionsRevenueAnalytics = async (eventId: string): Promise<SessionSummaryResponse> => {
    return await apiFetch<SessionSummaryResponse>(`${ORDER_API_PATH}/events/${eventId}/sessions`);
};

/**
 * Retrieves detailed order information for an event with optional filtering and sorting
 * 
 * @param eventId The ID of the event
 * @param options Optional parameters for filtering, sorting and pagination
 * @param options.sessionId Optional session ID to filter orders by
 * @param options.status Optional order status filter ('pending', 'completed', or 'cancelled')
 * @param options.sort Optional field to sort by (e.g. 'price', 'order_date')
 * @param options.order Optional sort direction ('asc' or 'desc')
 * @param options.limit Optional maximum number of results to return
 * @param options.offset Optional offset for pagination
 * @returns Detailed order information including customer details and order metrics
 */
export const getEventOrderDetails = async (
    eventId: string,
    options?: {
        sessionId?: string;
        status?: 'pending' | 'completed' | 'cancelled';
        sort?: string;
        order?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    }
): Promise<OrderDetailsResponse[]> => {
    const params = new URLSearchParams();
    
    if (options?.sessionId) {
        params.append('sessionId', options.sessionId);
    }
    
    if (options?.status) {
        params.append('status', options.status);
    }
    
    if (options?.sort) {
        params.append('sort', options.sort);
    }
    
    if (options?.order) {
        params.append('order', options.order);
    }
    
    if (options?.limit !== undefined) {
        params.append('limit', options.limit.toString());
    }
    
    if (options?.offset !== undefined) {
        params.append('offset', options.offset.toString());
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch<OrderDetailsResponse[]>(`${ORDER_API_PATH}/events/${eventId}/orders${queryString}`);
};
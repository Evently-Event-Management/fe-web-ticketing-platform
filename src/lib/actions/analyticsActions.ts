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
import { apiFetch } from '@/lib/api';
import { Session } from 'inspector/promises';

// Types for analytics responses
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

export interface TierSalesMetrics {
    tier_id: string;
    tier_name: string;
    tier_color: string;
    tickets_sold: number;
    revenue: number;
}

export interface EventAnalytics {
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

const API_BASE_PATH = '/order/analytics';

/**
 * Retrieves revenue analytics data for an entire event
 * 
 * @param eventId The ID of the event
 * @returns Event revenue analytics including total revenue, tickets sold, and daily sales
 */
export const getEventRevenueAnalytics = (eventId: string): Promise<EventAnalytics> => {
    return apiFetch<EventAnalytics>(`${API_BASE_PATH}/events/${eventId}`);
};

/**
 * Retrieves discount usage data for an event
 * 
 * @param eventId The ID of the event
 * @returns Discount usage statistics including usage counts and amounts by date
 */
export const getEventDiscountAnalytics = (eventId: string): Promise<EventDiscountAnalytics> => {
    return apiFetch<EventDiscountAnalytics>(`${API_BASE_PATH}/events/${eventId}/discounts`);
};

/**
 * Retrieves revenue analytics data for a specific session within an event
 * 
 * @param eventId The ID of the event
 * @param sessionId The ID of the session
 * @returns Session revenue analytics including total revenue, tickets sold, and daily sales
 */
export const getSessionAnalytics = (eventId: string, sessionId: string): Promise<SessionOrderAnalytics> => {
    return apiFetch<SessionOrderAnalytics>(`${API_BASE_PATH}/events/${eventId}/sessions/${sessionId}`);
};


export const getSessionsAnalytics = (eventId: string): Promise<SessionSummary[]> => {
    return apiFetch<SessionSummary[]>(`${API_BASE_PATH}/events/${eventId}/sessions`);
};
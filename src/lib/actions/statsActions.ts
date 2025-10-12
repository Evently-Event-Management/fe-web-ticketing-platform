import type { EventAnalytics as EventQueryAnalytics, SessionAnalytics as EventQuerySessionAnalytics, SessionSummary as EventSessionSummary } from '@/types/eventAnalytics';
import { apiFetch } from '@/lib/api';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { EventStatus } from '@/lib/validators/event';

const SESSION_ANALYTICS_API_PATH = '/event-seating/v1/session-analytics';

// Types based on backend DTOs

/**
 * Count of sessions by status
 */
export interface SessionStatusCountDTO {
    status: SessionStatus;
    count: number;
}

/**
 * Analytics response containing session counts by status
 */
export interface SessionAnalyticsResponse {
    organizationId: string;
    organizationName: string;
    eventId?: string; // Optional - will be null when getting analytics for an organization
    eventTitle?: string; // Optional - will be null when getting analytics for an organization
    totalSessions: number;
    sessionsByStatus: SessionStatusCountDTO[];
}

/**
 * DTO for sessions with their associated events
 */
export interface OrganizationSessionDTO {
    // Session details
    sessionId: string;
    startTime: string; // ISO 8601 format
    endTime: string; // ISO 8601 format
    salesStartTime: string; // ISO 8601 format
    sessionType: string;
    sessionStatus: SessionStatus;
    
    // Event details
    eventId: string;
    eventTitle: string;
    eventStatus: EventStatus;
    categoryName: string;
}

/**
 * Paginated response type for sessions
 */
export interface PaginatedSessionsResponse {
    content: OrganizationSessionDTO[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

/**
 * Fetches session analytics data for a specific event (counts by status)
 * @param eventId - The ID of the event to fetch session analytics for
 * @returns Promise with session analytics response
 */
export const getEventSessionAnalytics = async (eventId: string): Promise<SessionAnalyticsResponse> => {
    return await apiFetch<SessionAnalyticsResponse>(`${SESSION_ANALYTICS_API_PATH}/events/${eventId}`);
};

/**
 * Fetches session analytics data for a specific event as an admin (counts by status)
 * Requires admin privileges
 * @param eventId - The ID of the event to fetch session analytics for
 * @returns Promise with session analytics response
 */
export const getEventSessionAnalyticsAdmin = async (eventId: string): Promise<SessionAnalyticsResponse> => {
    return await apiFetch<SessionAnalyticsResponse>(`${SESSION_ANALYTICS_API_PATH}/admin/events/${eventId}`);
};

/**
 * Fetches session analytics data for an organization (counts by status)
 * @param organizationId - The ID of the organization to fetch session analytics for
 * @returns Promise with session analytics response
 */
export const getOrganizationSessionAnalytics = async (organizationId: string): Promise<SessionAnalyticsResponse> => {
    return await apiFetch<SessionAnalyticsResponse>(`${SESSION_ANALYTICS_API_PATH}/organizations/${organizationId}`);
};

/**
 * Fetches session analytics data for an organization as an admin (counts by status)
 * Requires admin privileges
 * @param organizationId - The ID of the organization to fetch session analytics for
 * @returns Promise with session analytics response
 */
export const getOrganizationSessionAnalyticsAdmin = async (organizationId: string): Promise<SessionAnalyticsResponse> => {
    return await apiFetch<SessionAnalyticsResponse>(`${SESSION_ANALYTICS_API_PATH}/admin/organizations/${organizationId}`);
};

/**
 * Fetches detailed session data for an organization with filtering and pagination
 * @param organizationId - The ID of the organization
 * @param status - Optional session status filter
 * @param page - Page number (0-indexed, defaults to 0)
 * @param size - Page size (defaults to 10)
 * @returns Promise with paginated session data
 */
export const getOrganizationSessions = async (
    organizationId: string,
    status?: SessionStatus,
    page: number = 0,
    size: number = 10
): Promise<PaginatedSessionsResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
    });
    
    if (status) {
        params.append('status', status);
    }
    
    return await apiFetch<PaginatedSessionsResponse>(
        `${SESSION_ANALYTICS_API_PATH}/organizations/${organizationId}/sessions?${params.toString()}`
    );
};

/**
 * Fetches detailed session data for an organization as an admin with filtering and pagination
 * Requires admin privileges
 * @param organizationId - The ID of the organization
 * @param status - Optional session status filter
 * @param page - Page number (0-indexed, defaults to 0)
 * @param size - Page size (defaults to 10)
 * @returns Promise with paginated session data
 */
export const getOrganizationSessionsAdmin = async (
    organizationId: string,
    status?: SessionStatus,
    page: number = 0,
    size: number = 10
): Promise<PaginatedSessionsResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
    });
    
    if (status) {
        params.append('status', status);
    }
    
    return await apiFetch<PaginatedSessionsResponse>(
        `${SESSION_ANALYTICS_API_PATH}/admin/organizations/${organizationId}/sessions?${params.toString()}`
    );
};
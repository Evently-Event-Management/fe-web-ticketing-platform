import type {EventAnalytics, SessionAnalytics, SessionSummary} from '@/types/eventAnalytics';
import {apiFetch} from "@/lib/api";

const API_BASE_PATH = `/event-query/v1/analytics`;

/**
 * Fetches comprehensive analytics for a specific event
 * @param eventId - The ID of the event to fetch analytics for
 * @returns Promise with event analytics data
 */
export const getEventAnalytics = async (eventId: string): Promise<EventAnalytics> => {
    return await apiFetch<EventAnalytics>(`${API_BASE_PATH}/events/${eventId}`);
};

/**
 * Fetches basic analytics for all sessions in an event
 * @param eventId - The ID of the event to fetch session analytics for
 * @returns Promise with an array of session summary data
 */
export const getAllSessionsAnalytics = async (eventId: string): Promise<SessionSummary[]> => {
    return await apiFetch<SessionSummary[]>(`${API_BASE_PATH}/events/${eventId}/sessions`);
};

/**
 * Fetches detailed analytics for a specific session
 * @param eventId - The ID of the event the session belongs to
 * @param sessionId - The ID of the session to fetch analytics for
 * @returns Promise with detailed session analytics data
 */
export const getSessionAnalytics = async (eventId: string, sessionId: string): Promise<SessionAnalytics> => {
    return await apiFetch<SessionAnalytics>(`${API_BASE_PATH}/events/${eventId}/sessions/${sessionId}`);
}
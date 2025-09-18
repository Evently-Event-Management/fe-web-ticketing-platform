import {apiFetch} from '@/lib/api';
import {CreateEventParsed} from '@/lib/validators/event';
import {EventDetailDTO, EventStatus, EventSummaryDTO} from '@/lib/validators/event';

import {PaginatedResponse} from "@/types/paginatedResponse";
import {EventResponseDTO} from "@/types/event";

const API_BASE_PATH = '/event-seating/v1/events';

// ================================================================================
// General User & Organizer Actions
// ================================================================================

/**
 * Creates a new event.
 */
export const createEvent = (eventData: CreateEventParsed, coverImages: File[]): Promise<EventResponseDTO> => {
    const formData = new FormData();
    formData.append('request', JSON.stringify(eventData));
    if (coverImages?.length > 0) {
        coverImages.forEach(file => formData.append('coverImages', file));
    }
    return apiFetch<EventResponseDTO>(API_BASE_PATH, {
        method: 'POST',
        body: formData,
    });
};

/**
 * Fetches event details for an event the current user OWNS.
 */
export const getMyEventById = (eventId: string): Promise<EventDetailDTO> => {
    return apiFetch<EventDetailDTO>(`${API_BASE_PATH}/${eventId}`);
};

/**
 * Fetches a paginated list of events for an organization the current user OWNS.
 */
export const getMyOrganizationEvents = (
    organizationId: string,
    status?: EventStatus,
    search?: string,
    page: number = 0,
    size: number = 10
): Promise<PaginatedResponse<EventSummaryDTO>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return apiFetch<PaginatedResponse<EventSummaryDTO>>(`${API_BASE_PATH}/organization/${organizationId}?${params.toString()}`);
};

/**
 * Deletes an event the current user OWNS.
 */
export const deleteEvent = (eventId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${eventId}`, {
        method: 'DELETE',
    });
};


// ================================================================================
// Administrator-Only Actions
// ================================================================================

/**
 * [ADMIN] Fetches event details for ANY event by its ID.
 */
export const getAnyEventById_Admin = (eventId: string): Promise<EventDetailDTO> => {
    return apiFetch<EventDetailDTO>(`${API_BASE_PATH}/admin/${eventId}`);
};

/**
 * [ADMIN] Fetches a paginated list of ALL events in the system.
 */
export const getAllEvents_Admin = (
    status?: EventStatus,
    search?: string,
    page: number = 0,
    size: number = 10
): Promise<PaginatedResponse<EventSummaryDTO>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return apiFetch<PaginatedResponse<EventSummaryDTO>>(`${API_BASE_PATH}/admin/all?${params.toString()}`);
};

/**
 * [ADMIN] Fetches a paginated list of events for ANY organization.
 */
export const getAnyOrganizationEvents_Admin = (
    organizationId: string,
    status?: EventStatus,
    search?: string,
    page: number = 0,
    size: number = 10
): Promise<PaginatedResponse<EventSummaryDTO>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return apiFetch<PaginatedResponse<EventSummaryDTO>>(`${API_BASE_PATH}/admin/organization/${organizationId}?${params.toString()}`);
};

/**
 * [ADMIN] Approves a pending event.
 * Returns void as the endpoint returns no content
 */
export const approveEvent_Admin = (eventId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${eventId}/approve`, {
        method: 'POST',
    });
};

/**
 * [ADMIN] Rejects a pending event.
 * Returns void as the endpoint returns no content
 */
export const rejectEvent_Admin = (eventId: string, reason: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${eventId}/reject`, {
        method: 'POST',
        body: JSON.stringify({reason}),
    });
};

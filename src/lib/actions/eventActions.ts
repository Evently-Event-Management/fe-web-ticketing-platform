import {apiFetch} from '@/lib/api';
import {CreateEventRequest, TierDTO} from '@/lib/validators/event';
import {EventDetailDTO, EventStatus, EventSummaryDTO} from '@/lib/validators/event';

import {PaginatedResponse} from "@/types/paginatedResponse";
import {EventResponseDTO} from "@/types/event";

const API_BASE_PATH = '/event-seating/v1/events';

/**
 * Subscription response interface
 */
export interface SubscriptionResponse {
  eventId?: string;
  sessionId?: string;
  organizationId?: string;
  message?: string;
  error?: string;
}

/**
 * Subscription status response interface
 */
export interface SubscriptionStatusResponse {
  subscribed: boolean;
}

// ================================================================================
// General User & Organizer Actions
// ================================================================================

/**
 * Creates a new event.
 */
export const createEvent = (eventData: CreateEventRequest, coverImages: File[]): Promise<EventResponseDTO> => {
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
// Event Tier Management
// ================================================================================

/**
 * Creates a new tier for an event
 * @param eventId The ID of the event
 * @param tierData The tier data to create
 */
export interface CreateTierRequest {
    name: string;
    color: string; // Must be a valid hex color code (e.g., #FF5733)
    price: number;
}

export const createTier = (eventId: string, tierData: CreateTierRequest): Promise<TierDTO> => {
    return apiFetch<TierDTO>(`${API_BASE_PATH}/${eventId}/tiers`, {
        method: 'POST',
        body: JSON.stringify(tierData),
    });
};

/**
 * Updates an existing tier for an event
 * @param eventId The ID of the event
 * @param tierId The ID of the tier to update
 * @param tierData The updated tier data
 */
export interface UpdateTierRequest {
    name?: string;
    color?: string; // Must be a valid hex color code (e.g., #FF5733)
    price?: number;
}

export const updateTier = (eventId: string, tierId: string, tierData: UpdateTierRequest): Promise<TierDTO> => {
    return apiFetch<TierDTO>(`${API_BASE_PATH}/${eventId}/tiers/${tierId}`, {
        method: 'PUT',
        body: JSON.stringify(tierData),
    });
};

/**
 * Deletes an existing tier from an event
 * @param eventId The ID of the event
 * @param tierId The ID of the tier to delete
 */
export const deleteTier = (eventId: string, tierId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${eventId}/tiers/${tierId}`, {
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

// ================================================================================
// Event Subscription Actions
// ================================================================================

/**
 * Subscribe to an event to receive notifications about updates
 * @param eventId The ID of the event to subscribe to
 */
export const subscribeToEvent = (eventId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>('/scheduler/subscription/v1/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      eventId: eventId
    }),
  });
};

/**
 * Unsubscribe from an event to stop receiving notifications
 * @param eventId The ID of the event to unsubscribe from
 */
export const unsubscribeFromEvent = (eventId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>(`/scheduler/subscription/v1/unsubscribe/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Check if the current user is subscribed to an event
 * @param eventId The ID of the event to check subscription status for
 */
export const checkEventSubscriptionStatus = (eventId: string): Promise<boolean> => {
  return apiFetch<SubscriptionStatusResponse>(`/scheduler/subscription/v1/status?eventId=${eventId}`, {
    method: 'GET'
  }).then(response => response.subscribed);
};

// ================================================================================
// Session Subscription Actions
// ================================================================================

/**
 * Subscribe to a session to receive notifications about updates
 * @param sessionId The ID of the session to subscribe to
 */
export const subscribeToSession = (sessionId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>('/scheduler/session-subscription/v1/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: sessionId
    }),
  });
};

/**
 * Unsubscribe from a session to stop receiving notifications
 * @param sessionId The ID of the session to unsubscribe from
 */
export const unsubscribeFromSession = (sessionId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>(`/scheduler/session-subscription/v1/unsubscribe/${sessionId}`, {
    method: 'DELETE'
  });
};

/**
 * Check if the current user is subscribed to a session
 * @param sessionId The ID of the session to check subscription status for
 */
export const checkSessionSubscriptionStatus = (sessionId: string): Promise<boolean> => {
  return apiFetch<SubscriptionStatusResponse>(`/scheduler/session-subscription/v1/status?sessionId=${sessionId}`, {
    method: 'GET'
  }).then(response => response.subscribed);
};

// ================================================================================
// Organization Subscription Actions
// ================================================================================

/**
 * Subscribe to an organization to receive notifications about updates
 * @param organizationId The ID of the organization to subscribe to
 */
export const subscribeToOrganization = (organizationId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>('/scheduler/organization-subscription/v1/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      organizationId: organizationId
    }),
  });
};

/**
 * Unsubscribe from an organization to stop receiving notifications
 * @param organizationId The ID of the organization to unsubscribe from
 */
export const unsubscribeFromOrganization = (organizationId: string): Promise<SubscriptionResponse> => {
  return apiFetch<SubscriptionResponse>(`/scheduler/organization-subscription/v1/unsubscribe/${organizationId}`, {
    method: 'DELETE'
  });
};

/**
 * Check if the current user is subscribed to an organization
 * @param organizationId The ID of the organization to check subscription status for
 */
export const checkOrganizationSubscriptionStatus = (organizationId: string): Promise<boolean> => {
  return apiFetch<SubscriptionStatusResponse>(`/scheduler/organization-subscription/v1/status?organizationId=${organizationId}`, {
    method: 'GET'
  }).then(response => response.subscribed);
};

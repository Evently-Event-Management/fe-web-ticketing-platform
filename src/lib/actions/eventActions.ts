import {CreateEventFormData} from "@/lib/validators/event";
import {apiFetch} from '@/lib/api';
import {EventDetailDTO, EventResponseDTO, EventStatus, EventSummaryDTO} from "@/types/event";

const API_BASE_PATH = '/event-seating/v1/events';

/**
 * Create a new event
 * @param eventData Form data for the new event
 * @param coverImages Cover images for the event
 */
export async function createEvent(eventData: CreateEventFormData, coverImages: File[]): Promise<EventResponseDTO> {
    try {
        const formData = new FormData();

        // Convert the event data to a JSON string and add it as a part
        formData.append('request', JSON.stringify(eventData));

        // Add each cover image as a separate part
        if (coverImages && coverImages.length > 0) {
            coverImages.forEach((file) => {
                formData.append('coverImages', file);
            });
        }

        // Use apiFetch instead of raw fetch
        return await apiFetch<EventResponseDTO>(`${API_BASE_PATH}`, {
            method: 'POST',
            body: formData,
            // No need to set headers, apiFetch handles that
        });
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}

/**
 * Fetch event details by ID
 * @param eventId The ID of the event to fetch
 */
export async function getEventById(eventId: string): Promise<EventDetailDTO> {
    try {
        return await apiFetch<EventDetailDTO>(`${API_BASE_PATH}/${eventId}`, {
            method: 'GET',
        });
    } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error);
        throw error;
    }
}

/**
 * Fetch all events (admin only)
 * @param status Optional filter for event status
 * @param search Optional search term for filtering events
 * @param page Page number (0-based)
 * @param size Number of events per page
 */
export async function getAllEvents(
    status?: EventStatus,
    search?: string,
    page: number = 0,
    size: number = 10
): Promise<{ content: EventSummaryDTO[], totalPages: number, totalElements: number }> {
    try {
        let url = `${API_BASE_PATH}?page=${page}&size=${size}`;

        if (status) {
            url += `&status=${status}`;
        }

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        return await apiFetch<{ content: EventSummaryDTO[], totalPages: number, totalElements: number }>(url, {
            method: 'GET',
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

/**
 * Get paginated list of events for a specific organization
 * @param organizationId The ID of the organization
 * @param status Optional filter for event status
 * @param search Optional search term for filtering events
 * @param page Page number (0-based)
 * @param size Number of events per page
 */
export async function getOrganizationEvents(
    organizationId: string,
    status?: EventStatus,
    search?: string,
    page: number = 0,
    size: number = 10
): Promise<{ content: EventSummaryDTO[], totalPages: number, totalElements: number }> {
    try {
        let url = `${API_BASE_PATH}/organization/${organizationId}?page=${page}&size=${size}`;

        if (status) {
            url += `&status=${status}`;
        }

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        return await apiFetch<{ content: EventSummaryDTO[], totalPages: number, totalElements: number }>(url, {
            method: 'GET',
        });
    } catch (error) {
        console.error(`Error fetching organization events for ${organizationId}:`, error);
        throw error;
    }
}

/**
 * Approve an event (admin only)
 * @param eventId The ID of the event to approve
 */
export async function approveEvent(eventId: string): Promise<void> {
    try {
        await apiFetch<void>(`${API_BASE_PATH}/${eventId}/approve`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error approving event ${eventId}:`, error);
        throw error;
    }
}

/**
 * Reject an event (admin only)
 * @param eventId The ID of the event to reject
 * @param reason The reason for rejecting the event
 */
export async function rejectEvent(eventId: string, reason: string): Promise<void> {
    try {
        await apiFetch<void>(`${API_BASE_PATH}/${eventId}/reject`, {
            method: 'POST',
            body: JSON.stringify({reason}),
        });
    } catch (error) {
        console.error(`Error rejecting event ${eventId}:`, error);
        throw error;
    }
}

/**
 * Delete an event
 * @param eventId The ID of the event to delete
 */
export async function deleteEvent(eventId: string): Promise<void> {
    try {
        await apiFetch<void>(`${API_BASE_PATH}/${eventId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting event ${eventId}:`, error);
        throw error;
    }
}

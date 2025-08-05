import { apiFetch } from '@/lib/api';
import { CreateEventRequest, EventResponse } from '@/types/event';

const API_BASE_PATH = '/event-seating/v1/events';

/**
 * Creates a new event with optional cover images.
 * This function constructs a multipart/form-data request.
 * @param request - The event data.
 * @param coverImages - An array of File objects for the cover photos.
 * @returns A promise that resolves to the newly created EventResponse.
 */
export const createEvent = (request: CreateEventRequest, coverImages: File[]): Promise<EventResponse> => {
    const formData = new FormData();

    // 1. Append the main request data as a JSON string blob
    // This is the standard way to send a JSON object alongside files.
    const requestBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('request', requestBlob);

    // 2. Append each image file
    coverImages.forEach((file) => {
        formData.append('coverImages', file);
    });

    // 3. Make the API call. Note: We do NOT set the Content-Type header here.
    // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
    return apiFetch<EventResponse>(API_BASE_PATH, {
        method: 'POST',
        body: formData,
    });
};

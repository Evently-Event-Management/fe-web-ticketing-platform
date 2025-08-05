import { apiFetch } from '@/lib/api';
import { VenueRequest, VenueResponse } from '@/types/venue';

const API_BASE_PATH = '/event-seating/v1/venues';

/**
 * Fetches all venues owned by the current user across all their organizations.
 * @returns A promise that resolves to an array of VenueResponse.
 */
export const getAllVenues = (): Promise<VenueResponse[]> => {
    return apiFetch<VenueResponse[]>(API_BASE_PATH);
};

/**
 * Fetches all venues for a specific organization.
 * @param organizationId - The ID of the organization.
 * @returns A promise that resolves to an array of VenueResponse.
 */
export const getVenuesByOrganization = (organizationId: string): Promise<VenueResponse[]> => {
    return apiFetch<VenueResponse[]>(`${API_BASE_PATH}/organization/${organizationId}`);
};

/**
 * Fetches a single venue by its ID.
 * @param venueId - The ID of the venue to fetch.
 * @returns A promise that resolves to a single VenueResponse.
 */
export const getVenueById = (venueId: string): Promise<VenueResponse> => {
    return apiFetch<VenueResponse>(`${API_BASE_PATH}/${venueId}`);
};

/**
 * Creates a new venue.
 * @param request - The data for the new venue.
 * @returns A promise that resolves to the newly created VenueResponse.
 */
export const createVenue = (request: VenueRequest): Promise<VenueResponse> => {
    return apiFetch<VenueResponse>(API_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(request),
    });
};

/**
 * Updates an existing venue.
 * @param venueId - The ID of the venue to update.
 * @param request - The updated data for the venue.
 * @returns A promise that resolves to the updated VenueResponse.
 */
export const updateVenue = (venueId: string, request: VenueRequest): Promise<VenueResponse> => {
    return apiFetch<VenueResponse>(`${API_BASE_PATH}/${venueId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });
};

/**
 * Deletes a venue by its ID.
 * @param venueId - The ID of the venue to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteVenue = (venueId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${venueId}`, {
        method: 'DELETE',
    });
};

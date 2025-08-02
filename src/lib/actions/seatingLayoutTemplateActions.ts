import { apiFetch } from '@/lib/api';
import {
    PaginatedResponse,
    SeatingLayoutTemplateRequest,
    SeatingLayoutTemplateResponse
} from '@/types/seating-layout';

const API_BASE_PATH = '/event-seating/v1/seating-templates';

/**
 * Fetches a paginated list of seating layout templates for a given organization.
 * @param organizationId - The ID of the organization.
 * @param page - The page number to retrieve (0-based).
 * @param size - The number of items per page.
 * @returns A promise that resolves to a paginated response of seating layout templates.
 */
export const getSeatingLayoutTemplatesByOrg = (
    organizationId: string,
    page: number,
    size: number
): Promise<PaginatedResponse<SeatingLayoutTemplateResponse>> => {
    return apiFetch<PaginatedResponse<SeatingLayoutTemplateResponse>>(
        `${API_BASE_PATH}/organization/${organizationId}?page=${page}&size=${size}`
    );
};

/**
 * Fetches a single seating layout template by its ID.
 * @param templateId - The ID of the template to fetch.
 * @returns A promise that resolves to a single seating layout template.
 */
export const getSeatingLayoutTemplateById = (templateId: string): Promise<SeatingLayoutTemplateResponse> => {
    return apiFetch<SeatingLayoutTemplateResponse>(`${API_BASE_PATH}/${templateId}`);
};

/**
 * Creates a new seating layout template.
 * @param request - The data for the new template.
 * @returns A promise that resolves to the newly created template.
 */
export const createSeatingLayoutTemplate = (request: SeatingLayoutTemplateRequest): Promise<SeatingLayoutTemplateResponse> => {
    return apiFetch<SeatingLayoutTemplateResponse>(API_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(request),
    });
};

/**
 * Updates an existing seating layout template.
 * @param templateId - The ID of the template to update.
 * @param request - The updated data for the template.
 * @returns A promise that resolves to the updated template.
 */
export const updateSeatingLayoutTemplate = (templateId: string, request: SeatingLayoutTemplateRequest): Promise<SeatingLayoutTemplateResponse> => {
    return apiFetch<SeatingLayoutTemplateResponse>(`${API_BASE_PATH}/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });
};

/**
 * Deletes a seating layout template by its ID.
 * @param templateId - The ID of the template to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteSeatingLayoutTemplate = (templateId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${templateId}`, {
        method: 'DELETE',
    });
};

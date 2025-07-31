import { apiFetch } from '@/lib/api';
import { OrganizationRequest, OrganizationResponse } from '@/types/oraganizations';

/**
 * Fetches all organizations for the current user.
 * @returns A promise that resolves to an array of OrganizationResponse.
 */
export const getOrganizations = (): Promise<OrganizationResponse[]> => {
    return apiFetch<OrganizationResponse[]>('/event-seating/v1/organizations');
};

/**
 * Fetches a single organization by its ID.
 * @param orgId - The ID of the organization to fetch.
 * @returns A promise that resolves to an OrganizationResponse.
 */
export const getOrganizationById = (orgId: string): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(`/event-seating/v1/organizations/${orgId}`);
};

/**
 * Creates a new organization.
 * @param newOrgRequest - The data for the new organization.
 * @returns A promise that resolves to the newly created OrganizationResponse.
 */
export const createNewOrganization = (newOrgRequest: OrganizationRequest): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>('/event-seating/v1/organizations', {
        method: 'POST',
        body: JSON.stringify(newOrgRequest),
    });
};

/**
 * Updates an existing organization.
 * @param orgId - The ID of the organization to update.
 * @param orgUpdateRequest - The updated data for the organization.
 * @returns A promise that resolves to the updated OrganizationResponse.
 */
export const updateOrganizationById = (orgId: string, orgUpdateRequest: OrganizationRequest): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(`/event-seating/v1/organizations/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(orgUpdateRequest),
    });
};

/**
 * Uploads a logo for a specific organization.
 * @param orgId - The ID of the organization.
 * @param file - The logo file to upload.
 * @returns A promise that resolves to the updated OrganizationResponse.
 */
export const uploadOrganizationLogo = (orgId: string, file: File): Promise<OrganizationResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Note: When using FormData, we do not set the 'Content-Type' header.
    // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
    return apiFetch<OrganizationResponse>(`/event-seating/v1/organizations/${orgId}/logo`, {
        method: 'POST',
        body: formData,
    });
};

/**
 * Removes the logo for a specific organization.
 * @param orgId - The ID of the organization.
 * @returns A promise that resolves when the operation is complete.
 */
export const removeOrganizationLogo = (orgId: string): Promise<void> => {
    return apiFetch<void>(`/event-seating/v1/organizations/${orgId}/logo`, {
        method: 'DELETE',
    });
};


/**
 * Deletes an organization by its ID.
 * @param orgId - The ID of the organization to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteOrganizationById = (orgId: string): Promise<void> => {
    return apiFetch<void>(`/event-seating/v1/organizations/${orgId}`, {
        method: 'DELETE',
    });
};

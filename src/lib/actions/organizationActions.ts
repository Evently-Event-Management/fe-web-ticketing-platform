import { apiFetch } from '@/lib/api';
import { OrganizationRequest, OrganizationResponse } from '@/types/oraganizations';

/**
 * Fetches all organizations for the current user.
 * @returns A promise that resolves to an array of OrganizationResponse.
 */
export const getOrganizations = (): Promise<OrganizationResponse[]> => {
    console.log('Fetching organizations...');
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
 * Deletes an organization by its ID.
 * @param orgId - The ID of the organization to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteOrganizationById = (orgId: string): Promise<void> => {
    return apiFetch<void>(`/event-seating/v1/organizations/${orgId}`, {
        method: 'DELETE',
    });
};

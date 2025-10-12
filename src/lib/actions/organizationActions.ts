import {apiFetch} from '@/lib/api';
import {
    InviteStaffRequest,
    OrganizationMemberResponse,
    OrganizationRequest,
    OrganizationResponse
} from '@/types/oraganizations';

const API_BASE_PATH = '/event-seating/v1/organizations';

// ================================================================================
// General User & Organizer Actions
// ================================================================================

/**
 * Fetches all organizations owned by the currently authenticated user.
 */
export const getMyOrganizations = (): Promise<OrganizationResponse[]> => {
    return apiFetch<OrganizationResponse[]>(`${API_BASE_PATH}/my`);
};

/**
 * Fetches details for a single organization the current user OWNS.
 */
export const getMyOrganizationById = (orgId: string): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(`${API_BASE_PATH}/${orgId}`);
};

/**
 * Creates a new organization for the current user.
 */
export const createNewOrganization = (newOrgRequest: OrganizationRequest): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(API_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(newOrgRequest),
    });
};

/**
 * Updates an organization the current user OWNS.
 */
export const updateOrganizationById = (orgId: string, orgUpdateRequest: OrganizationRequest): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(`${API_BASE_PATH}/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(orgUpdateRequest),
    });
};

/**
 * Uploads a logo for an organization the current user OWNS.
 */
export const uploadOrganizationLogo = (orgId: string, file: File): Promise<OrganizationResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<OrganizationResponse>(`${API_BASE_PATH}/${orgId}/logo`, {
        method: 'POST',
        body: formData,
    });
};

/**
 * Removes the logo for an organization the current user OWNS.
 */
export const removeOrganizationLogo = (orgId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${orgId}/logo`, {
        method: 'DELETE',
    });
};

/**
 * Deletes an organization the current user OWNS.
 */
export const deleteOrganizationById = (orgId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${orgId}`, {
        method: 'DELETE',
    });
};

/**
 * Add staff to an organization the current user OWNS.
 */
export const inviteStaffToOrganization = (orgId: string, request: InviteStaffRequest): Promise<OrganizationMemberResponse> => {
    return apiFetch<OrganizationMemberResponse>(`${API_BASE_PATH}/${orgId}/staff`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

export const getOrganizationMembers = (orgId: string): Promise<OrganizationMemberResponse[]> => {
    return apiFetch<OrganizationMemberResponse[]>(`${API_BASE_PATH}/${orgId}/staff`);
}

export const removeOrganizationMember = (orgId: string, userId: string): Promise<void> => {
    return apiFetch<void>(`${API_BASE_PATH}/${orgId}/staff/${userId}`, {
        method: 'DELETE',
    });
}

export const updateOrganizationMemberStatus = (orgId: string, userId: string, isActive: boolean): Promise<OrganizationMemberResponse> => {
    return apiFetch<OrganizationMemberResponse>(`${API_BASE_PATH}/${orgId}/staff/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
            isActive: isActive
        }),
    });
}


// ================================================================================
// Administrator-Only Actions
// ================================================================================

/**
 * [ADMIN] Fetches details for ANY organization by its ID.
 */
export const getAnyOrganizationById_Admin = (orgId: string): Promise<OrganizationResponse> => {
    return apiFetch<OrganizationResponse>(`${API_BASE_PATH}/admin/${orgId}`);
};

/**
 * [ADMIN] Fetches all organizations for a SPECIFIC user by their ID.
 */
export const getOrganizationsForUser_Admin = (userId: string): Promise<OrganizationResponse[]> => {
    return apiFetch<OrganizationResponse[]>(`${API_BASE_PATH}/admin/user/${userId}`);
};

// You might also want an admin action to get ALL organizations in the system (paginated)
// if you add that endpoint to your controller in the future.

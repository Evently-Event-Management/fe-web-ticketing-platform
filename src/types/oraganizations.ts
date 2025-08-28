export interface OrganizationResponse {
    id: string;
    name: string;
    logoUrl?: string;
    website?: string;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    eventCount?: number; // Add event count property
}

export interface OrganizationRequest {
    name: string;
    website?: string;
}

export enum OrganizationRole {
    SCANNER = "SCANNER",
}

export interface InviteStaffRequest {
    email: string;
    roles: string[]; // Now supporting multiple roles
}

export interface OrganizationMemberResponse {
    userId: string;
    email: string;
    name: string;
    roles: OrganizationRole[];
}
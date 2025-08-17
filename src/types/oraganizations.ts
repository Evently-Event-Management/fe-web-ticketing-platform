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

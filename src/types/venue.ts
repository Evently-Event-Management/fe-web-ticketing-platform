export interface VenueRequest {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    facilities?: string[];
    organizationId: string;
}

export interface VenueResponse {
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    facilities?: string[];
    organizationId: string;
    organizationName: string;
}

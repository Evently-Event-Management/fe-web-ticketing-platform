import {SessionStatus, SessionType} from "@/lib/validators/salesStartRuleType";

export interface EventResponseDTO {
    id: string;
    title: string;
    status: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface RejectEventRequest {
    reason: string;
}

export interface EventThumbnailDTO {
    id: string;
    title: string;
    coverPhotoUrl: string; // Only the first one
    organizationName: string;
    categoryName: string;
    earliestSession: {
        startTime: string; // ISO 8601 format
        venueName: string;
        city: string; // Extracted for display
    };
    startingPrice: number | null; // Use number for price, can be null if not available
}

// {
//     "id": "string",
//     "title": "string",
//     "description": "string",
//     "overview": "string",
//     "coverPhotos": [
//     "string"
// ],
//     "organization": {
//     "id": "string",
//         "name": "string",
//         "logoUrl": "string"
// },
//     "category": {
//     "id": "string",
//         "name": "string",
//         "parentName": "string"
// },
//     "tiers": [
//     {
//         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//         "name": "string",
//         "price": 0,
//         "color": "string"
//     }
// ]


export interface EventBasicInfoDTO {
    id: string;
    title: string;
    description: string;
    overview: string;
    coverPhotos: (string)[];
    organization: {
        id: string;
        name: string;
        logoUrl: string;
    } | null;
    category: {
        id: string;
        name: string;
        parentName?: string;
    } | null;
    tiers: {
        id: string;
        name: string;
        price: number;
        color: string;
    }[];
}


export interface SessionInfoBasicDTO {
    id: string;
    startTime: string; // ISO 8601 format
    endTime: string; // ISO 8601 format
    status: SessionStatus;
    sessionType: SessionType; // Assuming this is a string, adjust if it's an enum or another type
    venueDetails: {
        name: string;
        address?: string; // Optional, can be null
        onlineLink?: string; // Optional, can be null
        location?: {
            type: string; // e.g., "Point"
            coordinates: [number, number]; // [longitude, latitude]
        } | null; // Optional, can be null
    };
}
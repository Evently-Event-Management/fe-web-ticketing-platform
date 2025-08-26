import {ReadModelSeatStatus, SessionStatus, SessionType} from "@/lib/validators/enums";

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
    salesStartTime: string;
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

// {
//     "name": "string",
//     "layout": {
//     "blocks": [
//         {
//             "id": "string",
//             "name": "string",
//             "type": "string",
//             "position": {
//                 "x": 0.1,
//                 "y": 0.1
//             },
//             "rows": [
//                 {
//                     "id": "string",
//                     "label": "string",
//                     "seats": [
//                         {
//                             "id": "string",
//                             "label": "string",
//                             "status": "AVAILABLE",
//                             "tier": {
//                                 "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                                 "name": "string",
//                                 "price": 0,
//                                 "color": "string"
//                             }
//                         }
//                     ]
//                 }
//             ],
//             "seats": [
//                 {
//                     "id": "string",
//                     "label": "string",
//                     "status": "AVAILABLE",
//                     "tier": {
//                         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                         "name": "string",
//                         "price": 0,
//                         "color": "string"
//                     }
//                 }
//             ],
//             "capacity": 0,
//             "width": 0,
//             "height": 0
//         }
//     ]
// }
// }


export interface SeatingBlockDTO {
    id: string;
    name: string;
    type: 'seated_grid' | 'standing_capacity' | 'non_sellable';
    position: {
        x: number;
        y: number;
    };
    rows?: {
        id: string;
        label: string;
        seats: {
            id: string;
            label: string;
            status?: ReadModelSeatStatus;
            tier?: {
                id: string;
                name: string;
                price: number;
                color: string;
            }
        }[];
    }[];
    seats?: {
        id: string;
        label: string;
        status?: ReadModelSeatStatus;
        tier?: {
            id: string;
            name: string;
            price: number;
            color: string;
        };
    }[];
    capacity?: number | null; // Nullable, can be null if not set
    width?: number | null; // Nullable, can be null if not set
    height?: number | null; // Nullable, can be null if not set
}

export interface SessionSeatingMapDTO {
    name: string | null; // Nullable, can be null if not set
    layout: {
        blocks: SeatingBlockDTO[];
    };
}

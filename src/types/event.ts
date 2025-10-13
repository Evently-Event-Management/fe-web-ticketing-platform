import {SessionType} from "@/types/enums/sessionType";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {ReadModelSeatStatus} from "@/types/enums/readModelSeatStatus";
import {DiscountParameters} from "@/lib/validators/event";

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
    organizationId: string;
    categoryName: string;
    earliestSession: {
        startTime: string; // ISO 8601 format
        venueName: string;
        city: string; // Extracted for display
    };
    startingPrice: number | null;
    discounts: DiscountThumbnailDTO[] | null;
}

export interface DiscountThumbnailDTO {
    parameters: DiscountParameters,
    expiresAt: string | null;
    maxUsage: number | null;
    currentUsage: number | null;
}

export interface DiscountDTO {
    id: string;
    code: string;
    parameters: DiscountParameters;
    activeFrom: string | null;
    expiresAt: string | null;
    maxUsage: number | null;
    currentUsage: number | null;
    active: boolean;
    public: boolean;
    applicableTiers: {
        id: string;
        name: string;
        price: number;
        color: string;
    }[] | null;
}


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
    availableDiscounts: DiscountThumbnailDTO[];
}


export interface SessionInfoBasicDTO {
    id: string;
    eventId: string;
    organizationId: string;
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
    discounts: DiscountThumbnailDTO[];
}

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
        seats: SeatDTO[];
    }[];
    seats?: SeatDTO[];
    capacity?: number | null; // Nullable, can be null if not set
    width?: number | null; // Nullable, can be null if not set
    height?: number | null; // Nullable, can be null if not set
}

export interface SeatDTO {
    id: string;
    label: string;
    status?: ReadModelSeatStatus;
    tier?: {
        id: string;
        name: string;
        price: number;
        color: string;
    };
}

export interface SessionSeatingMapDTO {
    name: string | null; // Nullable, can be null if not set
    layout: {
        blocks: SeatingBlockDTO[];
    };
}


export type SelectedSeat = SeatDTO & {
    tier: {
        id: string;
        name: string;
        price: number;
        color: string;
    };
    blockName: string;
};
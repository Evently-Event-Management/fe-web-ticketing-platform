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
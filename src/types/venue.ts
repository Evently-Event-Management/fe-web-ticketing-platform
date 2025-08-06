// types/venue.ts

// This interface corresponds to the VenueDetailsDTO on the backend
// and is used for embedding venue information in a session.
export interface VenueDetails {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}
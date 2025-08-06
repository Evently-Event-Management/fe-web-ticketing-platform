// import {SessionSeatingMapRequest} from './sessionSeatingMap';
// import {VenueDetails} from './venue'; // ✅ Import the new VenueDetails type
//
// export interface TierRequest {
//     id: string; // Temporary client-side ID
//     name: string;
//     color?: string;
//     price: number;
// }
//
// export interface SessionRequest {
//     startTime: string; // ISO 8601 format
//     endTime: string;   // ISO 8601 format
//     salesStartRuleType: SalesStartRuleType;
//     salesStartHoursBefore?: number;
//     salesStartFixedDatetime?: string; // ISO 8601 format
//
//     // ✅ All location data is now session-specific
//     isOnline: boolean;
//     onlineLink?: string;
//     venueDetails?: VenueDetails; // Can be null if isOnline is true
//
//     layoutData: SessionSeatingMapRequest;
// }
//
// export interface CreateEventRequest {
//     title: string;
//     description?: string;
//     overview?: string;
//     organizationId: string;
//     categoryId: string; // ✅ Changed to a single string
//     tiers: TierRequest[];
//     sessions: SessionRequest[];
//     // ❌ REMOVED: venueId, isOnline, onlineLink, locationDescription
// }
//
// export interface EventResponse {
//     id: string;
//     title: string;
//     status: string;
//     organizationId: string;
//     createdAt: string;
// }

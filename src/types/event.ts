import {SessionSeatingMapRequest} from "@/types/sessionSeatingMap";

export enum SalesStartRuleType {
    IMMEDIATE = 'IMMEDIATE',
    ROLLING = 'ROLLING',
    FIXED = 'FIXED',
}


export interface TierRequest {
    id: string; // Temporary client-side ID
    name: string;
    color?: string;
    price: number;
}

export interface SessionRequest {
    startTime: string; // ISO 8601 format
    endTime: string;   // ISO 8601 format
    salesStartRuleType: SalesStartRuleType;
    salesStartHoursBefore?: number;
    salesStartFixedDatetime?: string; // ISO 8601 format
    layoutData: SessionSeatingMapRequest;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    overview?: string;
    organizationId: string;
    venueId?: string;
    categoryId: string;
    isOnline: boolean;
    onlineLink?: string;
    locationDescription?: string;
    tiers: TierRequest[];
    sessions: SessionRequest[];
}

export interface EventResponse {
    id: string;
    title: string;
    status: string;
    organizationId: string;
    createdAt: string;
}

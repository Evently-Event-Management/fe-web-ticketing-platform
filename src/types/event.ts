/**
 * Type definitions based on the provided Java DTOs
 */
import {SalesStartRuleType, SessionSeatingMap, Tier, VenueDetails} from "@/lib/validators/event";

export enum EventStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface EventResponseDTO {
    id: string;
    title: string;
    status: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventSummaryDTO {
    id: string;
    title: string;
    status: EventStatus;
    organizationName: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    coverPhoto: string;
    sessionCount: number;
    earliestSessionDate: string;
}

export interface EventDetailDTO {
    id: string;
    title: string;
    description: string;
    overview: string;
    status: EventStatus;
    rejectionReason: string | null;
    coverPhotos: string[];
    organizationId: string;
    organizationName: string;
    categoryId: string;
    categoryName: string;
    createdAt: string;
    updatedAt: string;
    tiers: Tier[];
    sessions: SessionDetailDTO[];
}

export interface SessionDetailDTO {
    id: string;
    startTime: string;
    endTime: string;
    isOnline: boolean;
    onlineLink: string | null;
    venueDetails: VenueDetails | null;
    salesStartRuleType: SalesStartRuleType;
    salesStartHoursBefore: number | null;
    salesStartFixedDatetime: string | null;
    status: string;
    layoutData: SessionSeatingMap;
}

export interface RejectEventRequest {
    reason: string;
}
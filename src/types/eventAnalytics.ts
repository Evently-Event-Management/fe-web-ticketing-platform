import {ReadModelSeatStatus, SessionStatus} from "@/lib/validators/enums";

/**
 * DTO representing occupancy analytics for a specific venue block.
 */
export interface BlockOccupancy {
    blockId: string;
    blockName: string;
    blockType: string;
    totalCapacity: number;
    seatsSold: number;
    occupancyPercentage: number;
}

/**
 * DTO representing sales analytics for a specific ticket tier.
 * Note: `totalRevenue` is typed as a number, but for high-precision
 * financial calculations, it might be received as a string from the backend.
 */
export interface TierSales {
    tierId: string;
    tierName: string;
    tierColor: string;
    ticketsSold: number;
    totalRevenue: number; // or string for precision
    percentageOfTotalSales: number;
}

/**
 * DTO representing basic analytics for an event session (summary view).
 * Note: `startTime` and `endTime` are strings in ISO 8601 format.
 * `sessionRevenue` is typed as a number, but may be a string for precision.
 */
export interface SessionSummary {
    sessionId: string;
    eventId: string;
    eventTitle: string;
    startTime: string; // ISO 8601 Date String
    endTime: string;   // ISO 8601 Date String
    sessionRevenue: number; // or string for precision
    sessionStatus: SessionStatus;
    ticketsSold: number;
    sessionCapacity: number;
    sellOutPercentage: number;
}

/**
 * DTO representing detailed analytics for a specific event session.
 * Extends SessionSummaryDTO to add detailed analytics information.
 * Note: Durations are typically represented as ISO 8601 duration strings (e.g., "PT2H30M").
 */
export interface SessionAnalytics extends SessionSummary {
    // Time-based insights
    timeUntilStart: string;      // ISO 8601 Duration String
    salesWindowDuration: string; // ISO 8601 Duration String

    // Sales breakdown
    salesByTier: TierSales[];

    // Seat status breakdown
    seatStatusBreakdown: Record<ReadModelSeatStatus, number>;

    // Block occupancy breakdown
    occupancyByBlock: BlockOccupancy[];
}


/**
 * DTO representing detailed analytics for a specific event session.
 * Extends SessionSummaryDTO to add detailed analytics information.
 * Note: Durations are typically represented as ISO 8601 duration strings (e.g., "PT2H30M").
 */
export interface SessionAnalytics extends SessionSummary {
    // Time-based insights
    timeUntilStart: string;      // ISO 8601 Duration String
    salesWindowDuration: string; // ISO 8601 Duration String

    // Sales breakdown
    salesByTier: TierSales[];

    // Block occupancy breakdown
    occupancyByBlock: BlockOccupancy[];
}


/**
 * DTO representing overall analytics for an event across all sessions.
 * Note: `totalRevenue` and `averageRevenuePerTicket` are typed as numbers,
 * but may be strings for high-precision financial values.
 */
export interface EventAnalytics {
    eventId: string;
    eventTitle: string;

    // Revenue metrics
    totalRevenue: number; // or string for precision
    averageRevenuePerTicket: number; // or string for precision

    // Capacity metrics
    totalTicketsSold: number;
    totalEventCapacity: number;
    overallSellOutPercentage: number;

    // Session status overview
    sessionStatusBreakdown: Record<SessionStatus, number>;

    // Tier sales breakdown
    salesByTier: TierSales[];
}
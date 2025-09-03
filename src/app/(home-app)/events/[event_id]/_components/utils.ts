// Calculate availability percentage for standing capacity blocks
import {SeatingBlockDTO} from "@/types/event";

export const getAvailabilityPercentage = (block: SeatingBlockDTO) => {
    // Count reserved/booked/locked seats if available
    if (!block.seats) return 100;

    const reservedCount = block.seats?.filter(seat =>
        seat.status === 'RESERVED' ||
        seat.status === 'BOOKED' ||
        seat.status === 'LOCKED'
    ).length || 0;

    return Math.max(0, Math.min(100, ((block.seats.length - reservedCount) / (block.seats.length)) * 100));
};

// Get the tier color for standing capacity blocks
export const getStandingAreaTierColor = (block: SeatingBlockDTO) => {
    if (block.type !== 'standing_capacity') return undefined;

    // Find first seat with tier info or return undefined
    return block.seats?.[0]?.tier?.color;
};
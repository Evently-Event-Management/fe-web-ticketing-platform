// src/types/sse.ts
import { ReadModelSeatStatus } from "@/lib/validators/enums";

/**
 * DTO for real-time seat status updates received via SSE.
 * Corresponds to the backend's `SeatStatusUpdateDto`.
 */
export interface SeatStatusUpdateDTO {
    seatIds: string[];
    status: ReadModelSeatStatus;
}
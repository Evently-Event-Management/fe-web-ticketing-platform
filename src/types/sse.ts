// src/types/sse.ts

import {ReadModelSeatStatus} from "@/types/enums/readModelSeatStatus";

/**
 * DTO for real-time seat status updates received via SSE.
 * Corresponds to the backend's `SeatStatusUpdateDto`.
 */
export interface SeatStatusUpdateDTO {
    seatIds: string[];
    status: ReadModelSeatStatus;
}
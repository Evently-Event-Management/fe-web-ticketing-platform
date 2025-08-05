import {BlockType, LayoutPosition as SeatingMapPosition} from "@/types/seatingLayout";

export interface Seat {
    id: string;      // Temporary client-side ID
    label: string;
    tierId?: string; // Temporary client-side ID of a TierRequest
    status?: 'AVAILABLE' | 'RESERVED';
}

export interface LayoutRow {
    id: string; // Temporary client-side ID
    label: string;
    seats: Seat[];
}

export interface SeatingMapBlock {
    id: string; // Temporary client-side ID
    name: string;
    type: BlockType
    position: SeatingMapPosition;
    rows?: LayoutRow[];
    capacity?: number;
    width?: number;
    height?: number;
    tierId?: string; // Temporary client-side ID of a TierRequest
}

export interface Layout {
    blocks: SeatingMapBlock[];
}

export interface SessionSeatingMapRequest {
    name: string;
    layout: Layout;
}
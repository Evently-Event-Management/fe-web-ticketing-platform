import {BlockType, LayoutPosition as SeatingMapPosition} from "@/types/seatingLayout";

export interface Seat {
    id: string;      // Temporary client-side ID
    label: string;
    tierId?: string; // Temporary client-side ID of a TierRequest
    status?: 'AVAILABLE' | 'RESERVED';
}

export interface Row {
    id: string; // Temporary client-side ID
    label: string;
    seats: Seat[];
}

export interface Block {
    id: string; // Temporary client-side ID
    name: string;
    type: BlockType;
    position: SeatingMapPosition;

    // For 'seated_grid' type
    rows?: Row[];

    // For 'standing_capacity' type
    capacity?: number;
    // ✅ ADDED: A flat list of seats for capacity-based blocks
    seats?: Seat[];

    // For resizable blocks
    width?: number;
    height?: number;
}

export interface Layout {
    blocks: Block[];
}

export interface SessionSeatingMapRequest {
    name: string;
    layout: Layout;
}

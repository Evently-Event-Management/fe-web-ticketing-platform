// This file defines the shapes of data sent to and received from the seating layout API.

// ✅ New generic type for Spring Boot's Page object
export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number; // The current page number
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}


// Matches the LayoutDataDTO.Position class
export interface LayoutPosition {
    x: number;
    y: number;
}

export type BlockType = 'seated_grid' | 'standing_capacity' | 'non_sellable';

// Matches the LayoutDataDTO.Block class
export interface LayoutBlock {
    id: string;
    name: string;
    type: BlockType;
    position: LayoutPosition;
    rows?: number;
    columns?: number;
    startRowLabel?: string;
    startColumnLabel?: number;
    width?: number;
    height?: number;
    capacity?: number;
}

// Matches the LayoutDataDTO.Layout class
export interface Layout {
    blocks: LayoutBlock[];
}

// Matches the top-level LayoutDataDTO class
export interface LayoutData {
    name: string;
    layout: Layout;
}

// Matches the SeatingLayoutTemplateRequest DTO on the backend
export interface SeatingLayoutTemplateRequest {
    name: string;
    organizationId: string;
    layoutData: LayoutData;
}

// Matches the SeatingLayoutTemplateDTO on the backend
export interface SeatingLayoutTemplateResponse {
    updatedAt: string;
    id: string;
    organizationId: string;
    name: string;
    layoutData: LayoutData;
}

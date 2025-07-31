export type BlockType = 'seated_grid' | 'standing_capacity' | 'non_sellable';

export interface Block {
    id: string;
    name: string;
    type: BlockType;
    position: { x: number; y: number };
    rows?: number;
    columns?: number;
    capacity?: number;
    width?: number;  // For resizable blocks
    height?: number; // For resizable blocks
}
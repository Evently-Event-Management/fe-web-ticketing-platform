'use client';

import * as React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {Block, Tier} from '@/lib/validators/event';
import {cn} from '@/lib/utils';

// --- Interactive Draggable Block for Seated Grids ---
interface DraggableBlockProps {
    block: Block;
    tiers: Tier[];
    onSeatClick: (blockId: string, rowId: string, seatId: string) => void;
}

export function InteractiveDraggableBlock({block, tiers, onSeatClick}: DraggableBlockProps) {
    const {setNodeRef} = useDraggable({
        id: block.id,
        disabled: true, // Dragging is disabled in assignment mode
    });

    const style = {
        // No transform needed as blocks are static in this editor
        left: block.position.x,
        top: block.position.y,
    };

    const getTierColor = (tierId?: string) => {
        if (tierId === 'RESERVED') return 'hsl(var(--muted-foreground))';
        if (!tierId) return undefined;
        const tier = tiers.find(t => t.id === tierId);
        return tier?.color || 'hsl(var(--primary))';
    };

    return (
        <div ref={setNodeRef} style={style} className="absolute p-3 bg-card border rounded-lg">
            <div className="flex flex-col text-center">
                <span className="text-sm font-medium">{block.name}</span>
                <div className="grid gap-1.5 mt-2"
                     style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, 1fr)`}}>
                    {block.rows?.map(row =>
                        row.seats.map(seat => (
                            <button
                                key={seat.id}
                                type="button"
                                onClick={() => onSeatClick(block.id, row.id, seat.id)}
                                className={cn(
                                    "h-6 w-6 rounded-full border text-xs font-mono transition-all hover:scale-110 flex items-center justify-center",
                                    seat.status === 'RESERVED' && "bg-muted-foreground text-primary-foreground line-through border-destructive border-2"
                                )}
                                style={{backgroundColor: seat.tierId && seat.status !== 'RESERVED' ? getTierColor(seat.tierId) : undefined}}
                            >
                                {seat.label}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Interactive Resizable Block for Standing Capacity ---
interface ResizableBlockProps {
    block: Block;
    tiers: Tier[];
    onClick: (blockId: string) => void;
}

export function InteractiveResizableBlock({block, tiers, onClick}: ResizableBlockProps) {
    const {setNodeRef} = useDraggable({
        id: block.id,
        disabled: true,
    });

    const style = {
        left: block.position.x,
        top: block.position.y,
        width: block.width,
        height: block.height,
    };

    // ✅ Determine the background color based on the tier of the seats inside the block.
    // For simplicity, we'll use the tier of the first seat as the representative color.
    const getBlockTierColor = () => {
        const firstTieredSeat = block.seats?.find(s => s.tierId);
        if (!firstTieredSeat || !firstTieredSeat.tierId) return undefined;
        const tier = tiers.find(t => t.id === firstTieredSeat.tierId);
        return tier?.color;
    };

    return (
        <div ref={setNodeRef} style={style} className="absolute">
            <div
                onClick={() => onClick(block.id)}
                className="p-2 bg-card border rounded-lg shadow-md box-border flex flex-col relative cursor-pointer h-full w-full"
                style={{backgroundColor: getBlockTierColor()}}
            >
                <div className="flex items-center gap-2 flex-grow">
                    <div className="flex flex-col text-center flex-grow">
                        <span className="text-sm font-medium">{block.name}</span>
                        <span className="text-xs text-muted-foreground">{block.capacity} capacity</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

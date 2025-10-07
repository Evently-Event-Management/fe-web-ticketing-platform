'use client';

import * as React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {Block, TierFormData} from '@/lib/validators/event';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';

// --- Interactive Draggable Block for Seated Grids ---
interface DraggableBlockProps {
    block: Block;
    tiers: TierFormData[];
    onSeatClick: (blockId: string, rowId: string, seatId: string) => void;
    onApplyToAllSeats?: (blockId: string) => void;  // New prop for handling apply to all
}

export function InteractiveDraggableBlock({block, tiers, onSeatClick, onApplyToAllSeats}: DraggableBlockProps) {
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
        if (tierId === 'RESERVED') return 'hsla(var(--muted-foreground), 0.5)'; // Added opacity
        if (!tierId) return undefined;
        const tier = tiers.find(t => t.id === tierId);
        // Add opacity to the color
        if (tier?.color) {
            // Handle HSL color format
            if (tier.color.startsWith('hsl')) {
                return tier.color.replace('hsl', 'hsla').replace(')', ', 0.5)');
            }
            // Handle hex or other formats by adding opacity suffix
            return `${tier.color}80`; // 80 is equivalent to 50% opacity in hex
        }
        return 'hsla(var(--primary), 0.5)'; // Added opacity
    };

    return (
        <div ref={setNodeRef} style={style} className="absolute p-3 bg-card border rounded-lg">
            <div className="flex flex-col text-center relative">
                <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-sm font-medium">{block.name}</span>
                    {onApplyToAllSeats && (
                        <Button
                            size="sm"
                            variant="outline"
                            type={'button'}
                            className="text-xs py-0 h-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                onApplyToAllSeats(block.id);
                            }}
                        >
                            Apply to All
                        </Button>
                    )}
                </div>
                <div className="grid gap-1.5"
                     style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, 1fr)`}}>
                    {block.rows?.map(row =>
                        row.seats.map(seat => (
                            <button
                                key={seat.id}
                                type="button"
                                onClick={() => onSeatClick(block.id, row.id, seat.id)}
                                className={cn(
                                    "h-6 w-6 rounded-full border text-xs font-mono transition-all hover:scale-110 flex items-center justify-center",
                                    seat.status === 'RESERVED' && "bg-muted-foreground/50 text-primary-foreground line-through border-destructive border-2"
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
    tiers: TierFormData[];
    onClick: (blockId: string) => void;
}

export function InteractiveResizableBlock({block, tiers, onClick}: ResizableBlockProps) {
    const {setNodeRef} = useDraggable({
        id: block.id,
        disabled: true,
    });

    // Fix the TypeScript error by ensuring width and height are valid CSS values
    const style: React.CSSProperties = {
        left: block.position.x,
        top: block.position.y,
        width: block.width ?? undefined,
        height: block.height ?? undefined,
    };

    // Determine the background color based on the tier of the seats inside the block
    // with 50% opacity
    const getBlockTierColor = () => {
        const firstTieredSeat = block.seats?.find(s => s.tierId);
        if (!firstTieredSeat || !firstTieredSeat.tierId) return undefined;
        const tier = tiers.find(t => t.id === firstTieredSeat.tierId);

        // Add opacity to the color
        if (tier?.color) {
            // Handle HSL color format
            if (tier.color.startsWith('hsl')) {
                return tier.color.replace('hsl', 'hsla').replace(')', ', 0.5)');
            }
            // Handle hex or other formats by adding opacity suffix
            return `${tier.color}80`; // 80 is equivalent to 50% opacity in hex
        }
        return undefined;
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

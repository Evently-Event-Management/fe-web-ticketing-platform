'use client';

import * as React from 'react';
import {useState} from 'react';
import {Block, Tier} from '@/lib/validators/event';
import {SessionSeatingMapRequest, Row, Seat} from '@/lib/validators/event';

import {TierPalette} from './TierPalette';
import {InteractiveDraggableBlock, InteractiveResizableBlock} from './InteractiveBlocks';
import {toast} from 'sonner';

interface TierAssignmentEditorProps {
    layoutData: SessionSeatingMapRequest; // Now receiving the already-prepared layout data
    tiers: Tier[];
    onChange: (layout: SessionSeatingMapRequest) => void;
}

export function TierAssignmentEditor({layoutData, tiers, onChange}: TierAssignmentEditorProps) {
    const [selectedTierId, setSelectedTierId] = useState<string | null>(tiers[0]?.id || null);

    const handleSeatClick = (blockId: string, rowId: string, seatId: string) => {
        // Deep copy to avoid state mutation issues
        const newLayout = JSON.parse(JSON.stringify(layoutData));
        const block = newLayout.layout.blocks.find((b: Block) => b.id === blockId);

        if (block?.rows) {
            const row = block.rows.find((r: Row) => r.id === rowId);
            if (row?.seats) {
                const seat = row.seats.find((s: Seat) => s.id === seatId);
                if (seat) {
                    if (selectedTierId === 'RESERVED') {
                        seat.status = seat.status === 'RESERVED' ? 'AVAILABLE' : 'RESERVED';
                        seat.tierId = undefined;
                    } else {
                        seat.tierId = seat.tierId === selectedTierId ? undefined : selectedTierId;
                        seat.status = 'AVAILABLE';
                    }
                }
            }
        }

        onChange(newLayout);
    };

    const handleBlockClick = (blockId: string) => {
        // Deep copy to avoid state mutation issues
        const newLayout = JSON.parse(JSON.stringify(layoutData));
        const block = newLayout.layout.blocks.find((b: Block) => b.id === blockId);

        if (block) {
            if (selectedTierId === 'RESERVED') {
                toast.warning("You cannot reserve an entire standing block. To make it unavailable, please edit the layout and change its type to 'non-sellable'.");
                return;
            }

            if (block.seats) {
                block.seats.forEach((seat: Seat) => {
                    seat.tierId = selectedTierId ?? undefined;
                });
            }
        }

        onChange(newLayout);
    };

    // Apply selected tier to all seats in a seated block
    const handleApplyToAllSeats = (blockId: string) => {
        // Deep copy to avoid state mutation issues
        const newLayout = JSON.parse(JSON.stringify(layoutData));
        const block = newLayout.layout.blocks.find((b: Block) => b.id === blockId);

        if (block?.rows) {
            // Handle 'RESERVED' status specially
            if (selectedTierId === 'RESERVED') {
                for (const row of block.rows) {
                    for (const seat of row.seats) {
                        seat.status = 'RESERVED';
                        seat.tierId = undefined;
                    }
                }
                toast.success(`All seats in ${block.name} have been reserved`);
            } else {
                // Apply the selected tier to all seats
                for (const row of block.rows) {
                    for (const seat of row.seats) {
                        seat.tierId = selectedTierId;
                        seat.status = 'AVAILABLE';
                    }
                }
                const tierName = tiers.find(t => t.id === selectedTierId)?.name;
                toast.success(`Applied ${tierName || 'selected tier'} to all available seats in ${block.name}`);
            }
        }

        onChange(newLayout);
    };

    return (
        <div className="flex h-[70vh] border rounded-lg">
            <main className="flex-1 relative bg-muted/20 overflow-auto">
                <div className="relative w-full h-full p-4">
                    {layoutData.layout.blocks.map(block => {
                        if (block.type === 'seated_grid') {
                            return <InteractiveDraggableBlock
                                key={block.id}
                                block={block}
                                tiers={tiers}
                                onSeatClick={handleSeatClick}
                                onApplyToAllSeats={handleApplyToAllSeats}
                            />;
                        }
                        if (block.type === 'standing_capacity') {
                            return <InteractiveResizableBlock
                                key={block.id}
                                block={block}
                                tiers={tiers}
                                onClick={handleBlockClick}
                            />;
                        }
                        return (
                            <div key={block.id} style={{
                                left: block.position.x,
                                top: block.position.y,
                                width: block.width ? block.width : undefined,
                                height: block.height ? block.height : undefined
                            }}
                                 className="absolute p-2 bg-muted border rounded-lg flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">{block.name}</p>
                            </div>
                        );
                    })}
                </div>
            </main>
            <TierPalette tiers={tiers} selectedTierId={selectedTierId} onSelectTier={setSelectedTierId}/>
        </div>
    );
}

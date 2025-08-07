'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {Block, CreateEventFormData} from '@/lib/validators/event';
import {SessionSeatingMapRequest, Row, Seat} from '@/lib/validators/event';

import {TierPalette} from './TierPalette';
import {InteractiveDraggableBlock, InteractiveResizableBlock} from './InteractiveBlocks';
import {toast} from 'sonner';

import {getRowLabel} from "@/app/manage/organization/[organization_id]/seating/create/_lib/getRowLabel";
import {LayoutData} from "@/types/seatingLayout";

interface TierAssignmentEditorProps {
    initialLayout: LayoutData;
    onSave: (layout: SessionSeatingMapRequest) => void;
}

export function TierAssignmentEditor({initialLayout, onSave}: TierAssignmentEditorProps) {
    const {watch} = useFormContext<CreateEventFormData>();
    const tiers = watch('tiers');
    const [layoutData, setLayoutData] = useState<SessionSeatingMapRequest | null>(null);
    const [selectedTierId, setSelectedTierId] = useState<string | null>(tiers[0]?.id || null);

    // ✅ This effect performs the crucial transformation from a structural template to a full seating map.
    useEffect(() => {
        const transformedBlocks = initialLayout.layout.blocks.map((block) => {
            const newBlock: Block = {
                ...block,
                rows: [],
                seats: [],
            };

            if (block.type === 'seated_grid' && block.rows && block.columns) {
                const startRowIndex = block.startRowLabel ? block.startRowLabel.charCodeAt(0) - 'A'.charCodeAt(0) : 0;
                const startCol = block.startColumnLabel || 1;
                const numRows = block.rows;
                const numColumns = block.columns;

                newBlock.rows = Array.from({length: numRows}, (_, rowIndex) => {
                    const newRow: Row = {
                        id: `temp_row_${block.id}_${rowIndex}`,
                        label: `${getRowLabel(startRowIndex + rowIndex)}`,
                        seats: Array.from({length: numColumns}, (_, colIndex) => ({
                            id: `temp_seat_${block.id}_${rowIndex}_${colIndex}`,
                            label: `${startCol + colIndex}${getRowLabel(startRowIndex + rowIndex)}`,
                            status: 'AVAILABLE',
                        })),
                    };
                    return newRow;
                });
            } else if (block.type === 'standing_capacity' && block.capacity) {
                const capacity = block.capacity;
                newBlock.seats = Array.from({length: capacity}, (_, i) => ({
                    id: `temp_seat_${block.id}_${i}`,
                    label: `Slot ${i + 1}`,
                    status: 'AVAILABLE',
                }));
            }
            return newBlock;
        });

        setLayoutData({
            name: initialLayout.name,
            layout: {
                blocks: transformedBlocks,
            },
        });
    }, [initialLayout]);


    const handleSeatClick = (blockId: string, rowId: string, seatId: string) => {
        if (!layoutData) return;
        setLayoutData(prevLayout => {
            // Deep copy to avoid state mutation issues
            const newLayout = JSON.parse(JSON.stringify(prevLayout));
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
            return newLayout;
        });
    };

    const handleBlockClick = (blockId: string) => {
        if (!layoutData) return;
        setLayoutData(prevLayout => {
            const newLayout = JSON.parse(JSON.stringify(prevLayout));
            const block = newLayout.layout.blocks.find((b: Block) => b.id === blockId);
            if (block) {
                if (selectedTierId === 'RESERVED') {
                    toast.warning("You cannot reserve an entire standing block. To make it unavailable, please edit the layout and change its type to 'non-sellable'.");
                    return prevLayout;
                }
                if (block.seats) {
                    block.seats.forEach((seat: Seat) => {
                        seat.tierId = selectedTierId ?? undefined;
                    });
                }
            }
            return newLayout;
        });
    };

    // New function to apply selected tier to all seats in a seated block
    const handleApplyToAllSeats = (blockId: string) => {
        if (!layoutData) return;

        setLayoutData(prevLayout => {
            const newLayout = JSON.parse(JSON.stringify(prevLayout));
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

            return newLayout;
        });
    };

    if (!layoutData) {
        return <div>Loading layout...</div>; // Or a skeleton loader
    }

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
                            return <InteractiveResizableBlock key={block.id} block={block} tiers={tiers}
                                                              onClick={handleBlockClick}/>;
                        }
                        return (
                            <div key={block.id} style={{
                                left: block.position.x,
                                top: block.position.y,
                                width: block.width,
                                height: block.height
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

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionDTO, TierFormData } from "@/lib/validators/event";
import { getTierColor, getTierName } from "@/lib/utils";
import { SessionType } from "@/types/enums/sessionType";
import { SeatStatus } from "@/types/enums/SeatStatus";

interface SeatingLayoutProps {
    session: SessionDTO;
    tiers: TierFormData[];
}

export const CustomSeatingLayout: React.FC<SeatingLayoutProps> = ({ session, tiers }) => {
    const { layoutData } = session;

    // Only render for physical events with layout data
    if (!layoutData || session.sessionType !== SessionType.PHYSICAL) return null;

    // Get status style for a seat
    const getSeatStatusStyle = (status: string | undefined) => {
        switch (status) {
            case SeatStatus.RESERVED:
                return { opacity: 0.3, cursor: 'not-allowed' };
            case SeatStatus.BOOKED:
                return { opacity: 1, border: '2px solid #22C55E', cursor: 'not-allowed' }; // Green border for booked seats
            default:
                return { opacity: 1 };
        }
    };

    // Get variant for status badge
    const getStatusVariant = (status: string | undefined) => {
        switch (status) {
            case SeatStatus.RESERVED:
                return 'secondary';
            case SeatStatus.BOOKED:
                return 'default';
            default:
                return 'outline';
        }
    };

    // Get status label
    const getStatusLabel = (status: string | undefined) => {
        if (!status) return 'Available';
        
        switch (status) {
            case SeatStatus.RESERVED:
                return 'Reserved';
            case SeatStatus.BOOKED:
                return 'Booked';
            case SeatStatus.AVAILABLE:
                return 'Available';
            default:
                return status;
        }
    };

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Seating Layout</h3>
            <div className="relative bg-muted/30 min-h-[400px] p-4 rounded-lg overflow-auto">
                {layoutData.layout.blocks.map(block => {
                    // Get tier color for the block based on first seat's tier
                    const firstSeatTierId = block.seats?.[0]?.tierId;
                    const blockTierColor = firstSeatTierId ?
                        `${getTierColor(firstSeatTierId, session, tiers)}80` : // 50% opacity
                        undefined;

                    return (
                        <div
                            key={block.id}
                            className={`absolute border rounded-lg p-3 shadow-sm ${block.type === 'non_sellable' ? 'flex items-center justify-center' : 'bg-card'}`}
                            style={{
                                left: block.position.x,
                                top: block.position.y,
                                width: block.width ? `${block.width}px` : 'auto',
                                height: block.height ? `${block.height}px` : 'auto',
                                backgroundColor: blockTierColor || undefined
                            }}
                        >
                            {block.type !== 'non_sellable' && (
                                <div className="text-sm font-medium mb-1">{block.name}</div>
                            )}

                            {block.type === 'seated_grid' && block.rows && (
                                <div
                                    className="grid gap-1"
                                    style={{
                                        gridTemplateColumns: `repeat(${block.rows[0]?.seats?.length || 1}, 1fr)`
                                    }}
                                >
                                    {block.rows.map(row =>
                                        row.seats.map(seat => {
                                            const seatStatusStyle = getSeatStatusStyle(seat.status);
                                            
                                            return (
                                                <Popover key={seat.id}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0 rounded-full text-xs font-mono"
                                                            style={{
                                                                backgroundColor: seat.tierId ?
                                                                    `${getTierColor(seat.tierId, session, tiers)}80` : // 50% opacity
                                                                    undefined,
                                                                ...seatStatusStyle
                                                            }}
                                                            disabled={seat.status === SeatStatus.RESERVED || seat.status === SeatStatus.BOOKED}
                                                        >
                                                            {seat.label}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent side="top" className="w-60 p-0">
                                                        <div className="p-4">
                                                            <div className="font-semibold mb-2">Seat Information</div>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Block:</span>
                                                                    <span>{block.name}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Row:</span>
                                                                    <span>{row.label}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Seat:</span>
                                                                    <span>{seat.label}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Status:</span>
                                                                    <Badge variant={getStatusVariant(seat.status)}>
                                                                        {getStatusLabel(seat.status)}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Tier:</span>
                                                                    <div className="flex items-center gap-1">
                                                                        {seat.tierId && (
                                                                            <div
                                                                                className="h-3 w-3 rounded-full"
                                                                                style={{
                                                                                    backgroundColor: getTierColor(seat.tierId, session, tiers)
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <span>
                                                                            {seat.tierId ? getTierName(seat.tierId, session, tiers) : 'Unassigned'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {block.type === 'standing_capacity' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-sm text-center">
                                        <span className="block font-medium">Standing Area</span>
                                        <span className="text-muted-foreground">
                                            Capacity: {block.capacity || 0}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {block.type === 'non_sellable' && (
                                <div
                                    className="text-sm text-muted-foreground w-full h-full flex items-center justify-center">
                                    {block.name}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            
            {/* Legend for seat status */}
            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/40 border">
                    </div>
                    <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-card border"></div>
                    <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-card border-2 border-green-500"></div>
                    <span className="text-sm">Booked</span>
                </div>
            </div>
        </div>
    );
};
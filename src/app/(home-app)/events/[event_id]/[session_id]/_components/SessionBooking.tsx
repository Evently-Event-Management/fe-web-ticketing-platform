'use client';

import React, {useState, useEffect} from 'react';
import {SeatDTO, SessionInfoBasicDTO, SessionSeatingMapDTO} from "@/types/event";
import {getSessionSeatingMap} from "@/lib/actions/public/SessionActions";
import {Skeleton} from "@/components/ui/skeleton";
import {ReadModelSeatStatus, SessionType} from "@/lib/validators/enums";
import {SelectionSummary} from "./SelectionSummery";
import {SeatingLayout} from "./SeatingLayout";
import {OnlineTicketSelection} from "./OnlineTicketSelection"; // Import the new component

// A detailed type for a seat that has been selected by the user
export type SelectedSeat = SeatDTO & {
    tier: {
        id: string;
        name: string;
        price: number;
        color: string;
    };
    blockName: string;
};

export default function SessionBooking({session}: { session: SessionInfoBasicDTO }) {
    const [seatingMap, setSeatingMap] = useState<SessionSeatingMapDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

    useEffect(() => {
        if (session.id) {
            getSessionSeatingMap(session.id)
                .then(data => setSeatingMap(data))
                .catch(err => console.error("Failed to fetch seating map", err))
                .finally(() => setIsLoading(false));
        }
    }, [session.id]);

    // --- Handler for PHYSICAL seat selection ---
    const handleSeatSelect = (
        seat: SeatDTO,
        blockName: string,
    ) => {
        if ((seat.status && seat.status !== ReadModelSeatStatus.AVAILABLE) || !seat.tier) {
            return;
        }
        const fullSeatInfo: SelectedSeat = {...seat, tier: seat.tier, blockName};
        setSelectedSeats(prev => {
            const isSelected = prev.some(s => s.id === seat.id);
            return isSelected
                ? prev.filter(s => s.id !== seat.id)
                : [...prev, fullSeatInfo];
        });
    };

    // --- New Handler for ONLINE quantity selection ---
    const handleQuantitySelect = (quantity: number) => {
        if (!seatingMap) return;

        const onlineBlock = seatingMap.layout.blocks.find(b => b.type === 'standing_capacity');
        if (!onlineBlock?.seats) return;

        const availableSeats = onlineBlock.seats.filter(
            seat => !seat.status || seat.status === ReadModelSeatStatus.AVAILABLE
        );

        if (quantity > availableSeats.length) {
            console.error("Not enough tickets available to meet the request.");
            // Optionally, add user-facing feedback here (e.g., a toast notification)
            return;
        }

        const seatsToSelect = availableSeats.slice(0, quantity);
        const formattedSeats: SelectedSeat[] = seatsToSelect.map(seat => ({
            ...seat,
            tier: seat.tier!, // Assume online tickets always have a tier
            blockName: onlineBlock.name,
        }));
        setSelectedSeats(formattedSeats);
    };


    if (isLoading) {
        return <BookingPageSkeleton/>;
    }

    if (!seatingMap) {
        return <div className="text-center py-10">Failed to load seating information. Please try again later.</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {/* --- CONDITIONAL RENDERING --- */}
                    {session.sessionType === SessionType.PHYSICAL ? (
                        <SeatingLayout
                            seatingMap={seatingMap}
                            selectedSeats={selectedSeats}
                            onSeatSelect={handleSeatSelect}
                        />
                    ) : (
                        <OnlineTicketSelection
                            seatingMap={seatingMap}
                            onSelectQuantityAction={handleQuantitySelect}
                            selectedQuantity={selectedSeats.length}
                        />
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <SelectionSummary
                            selectedSeats={selectedSeats}
                            onSeatRemove={(seatId) => setSelectedSeats(prev => prev.filter(s => s.id !== seatId))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const BookingPageSkeleton = () => (
    // Skeleton remains the same, it works for both layouts during loading
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Skeleton className="h-[600px] w-full"/>
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-[400px] w-full"/>
            </div>
        </div>
    </div>
);
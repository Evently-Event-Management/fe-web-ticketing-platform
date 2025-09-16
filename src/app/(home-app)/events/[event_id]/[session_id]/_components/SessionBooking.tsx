'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SeatDTO, SessionInfoBasicDTO, SessionSeatingMapDTO} from "@/types/event";
import {getSessionSeatingMap} from "@/lib/actions/public/SessionActions";
import {Skeleton} from "@/components/ui/skeleton";
import {SelectionSummary} from "./SelectionSummery";
import {SeatingLayout} from "./SeatingLayout";
import {OnlineTicketSelection} from "./OnlineTicketSelection";
import {SeatStatusUpdateDTO} from "@/types/sse";
import {subscribeToSeatStatusUpdates} from "@/lib/actions/public/sseActions";
import {toast} from "sonner";
import {useAuth} from "@/providers/AuthProvider";
import Notice from "@/components/ui/Notice";
import {SessionType} from "@/types/enums/sessionType";
import {ReadModelSeatStatus} from "@/types/enums/readModelSeatStatus";

// This type definition remains the same as it's used for props
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
    const {isAuthenticated} = useAuth()

    // --- CHANGE #1: Store only the IDs of selected seats ---
    // This creates a single source of truth for all seat data: the `seatingMap`.
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

    // Effect for fetching the initial seating map data
    useEffect(() => {
        if (session.id) {
            getSessionSeatingMap(session.id)
                .then(data => setSeatingMap(data))
                .catch(err => console.error("Failed to fetch seating map", err))
                .finally(() => setIsLoading(false));
        }
    }, [session.id]);

    // --- CHANGE #2: A stable, efficient callback for handling SSE updates ---
    // Updated to handle seats both in rows and directly under blocks
    const updateSeatStatuses = useCallback((seatIds: string[], status: ReadModelSeatStatus) => {
        // Update the master seatingMap state
        setSeatingMap(prevMap => {
            if (!prevMap) return prevMap;
            const updatedSeatingMap = JSON.parse(JSON.stringify(prevMap)) as SessionSeatingMapDTO;
            let seatsUpdated = false;

            updatedSeatingMap.layout.blocks.forEach(block => {
                // Handle seats in rows
                if (block.rows) {
                    block.rows.forEach(row => {
                        row.seats.forEach(seat => {
                            if (seatIds.includes(seat.id)) {
                                seat.status = status;
                                seatsUpdated = true;
                            }
                        });
                    });
                }

                // Handle seats directly under block
                if (block.seats) {
                    block.seats.forEach(seat => {
                        if (seatIds.includes(seat.id)) {
                            seat.status = status;
                            seatsUpdated = true;
                        }
                    });
                }
            });
            return seatsUpdated ? updatedSeatingMap : prevMap;
        });

        // If seats were locked or booked by someone else, remove them from our selection
        if (status === ReadModelSeatStatus.LOCKED || status === ReadModelSeatStatus.BOOKED) {
            setSelectedSeatIds(prevIds => {
                const idsToRemove = new Set(prevIds.filter(id => seatIds.includes(id)));
                if (idsToRemove.size > 0) {
                    toast.warning(`Some selected seats are no longer available`, {
                        description: "They have been removed from your selection.",
                        duration: 5000,
                    });
                    return prevIds.filter(id => !idsToRemove.has(id));
                }
                return prevIds;
            });
        }
    }, []); // Empty dependency array makes this function stable

    // --- CHANGE #3: Corrected useEffect for a stable SSE connection ---
    useEffect(() => {
        if (!session.id) return;

        const eventSource = subscribeToSeatStatusUpdates(session.id);

        const handleSeatStatusUpdate = (event: MessageEvent) => {
            const data: SeatStatusUpdateDTO = JSON.parse(event.data);
            console.log("SSE Received:", data);
            updateSeatStatuses(data.seatIds, data.status);
        };

        eventSource.addEventListener(ReadModelSeatStatus.LOCKED, handleSeatStatusUpdate);
        eventSource.addEventListener(ReadModelSeatStatus.AVAILABLE, handleSeatStatusUpdate);
        eventSource.addEventListener(ReadModelSeatStatus.BOOKED, handleSeatStatusUpdate);
        eventSource.addEventListener(ReadModelSeatStatus.RESERVED, handleSeatStatusUpdate);

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            // The browser will automatically attempt to reconnect on error.
            // You may want to close it definitively under certain conditions.
        };

        // Cleanup function to close the connection when the component unmounts
        return () => {
            eventSource.removeEventListener(ReadModelSeatStatus.LOCKED, handleSeatStatusUpdate);
            eventSource.removeEventListener(ReadModelSeatStatus.AVAILABLE, handleSeatStatusUpdate);
            eventSource.removeEventListener(ReadModelSeatStatus.BOOKED, handleSeatStatusUpdate);
            eventSource.removeEventListener(ReadModelSeatStatus.RESERVED, handleSeatStatusUpdate);
            eventSource.close();
            console.log('SSE connection closed.');
        };
        // This hook now only re-runs if the session ID changes, which is correct.
    }, [session.id, updateSeatStatuses]);


    // --- CHANGE #4: Derive the full selected seat data from the single source of truth ---
    // Updated to include seats both in rows and directly under blocks
    const selectedSeatsData = useMemo((): SelectedSeat[] => {
        if (!seatingMap) return [];
        const seatMap = new Map<string, SelectedSeat>();

        seatingMap.layout.blocks.forEach(block => {
            // Process seats in rows
            if (block.rows) {
                block.rows.forEach(row => {
                    row.seats.forEach(seat => {
                        if (seat.tier) {
                            seatMap.set(seat.id, {...seat, tier: seat.tier, blockName: block.name});
                        }
                    });
                });
            }

            // Process seats directly under the block
            if (block.seats) {
                block.seats.forEach(seat => {
                    if (seat.tier) {
                        seatMap.set(seat.id, {...seat, tier: seat.tier, blockName: block.name});
                    }
                });
            }
        });
        return selectedSeatIds.map(id => seatMap.get(id)).filter((s): s is SelectedSeat => s !== undefined);
    }, [selectedSeatIds, seatingMap]);


    // --- CHANGE #5: Update handlers to work with seat IDs ---
    const handleSeatSelect = useCallback((seat: SeatDTO) => {
        if (seat.status && seat.status !== ReadModelSeatStatus.AVAILABLE) return;

        setSelectedSeatIds(prev => {
            const isSelected = prev.includes(seat.id);
            return isSelected
                ? prev.filter(id => id !== seat.id)
                : [...prev, seat.id];
        });
    }, []);

    const handleQuantitySelect = useCallback((quantity: number) => {
        if (!seatingMap) return;
        const onlineBlock = seatingMap.layout.blocks.find(b => b.type === 'standing_capacity');
        if (!onlineBlock) return;

        // Get all seats from the online block (both in rows and direct)
        const allSeats = [];
        if (onlineBlock.rows) {
            allSeats.push(...onlineBlock.rows.flatMap(r => r.seats || []));
        }
        if (onlineBlock.seats) {
            allSeats.push(...onlineBlock.seats);
        }

        const availableSeats = allSeats.filter(
            seat => !seat.status || seat.status === ReadModelSeatStatus.AVAILABLE
        );

        if (quantity > availableSeats.length) {
            toast.error("Not enough tickets available.");
            return;
        }

        const seatIdsToSelect = availableSeats.slice(0, quantity).map(seat => seat.id);
        setSelectedSeatIds(seatIdsToSelect);
    }, [seatingMap]);


    if (isLoading) {
        return <BookingPageSkeleton/>;
    }

    if (!seatingMap) {
        return <div className="text-center py-10">Failed to load seating information. Please try again later.</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center py-10 max-w-md mx-auto">
                <Notice
                    title={"Login Required"}
                    message={"You need to be logged in to book tickets for this session."}
                    submessage={'Please log in or create an account to continue.'}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col" id="sessions-section">
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {session.sessionType === SessionType.PHYSICAL ? (
                        <SeatingLayout
                            seatingMap={seatingMap}
                            selectedSeats={selectedSeatsData.map(s => s.id)}
                            onSeatSelect={handleSeatSelect}
                        />
                    ) : (
                        <OnlineTicketSelection
                            seatingMap={seatingMap}
                            onSelectQuantityAction={handleQuantitySelect}
                            selectedQuantity={selectedSeatIds.length}
                        />
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <SelectionSummary
                            selectedSeats={selectedSeatsData}
                            onSeatRemove={(seatId) => setSelectedSeatIds(prev => prev.filter(id => id !== seatId))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const BookingPageSkeleton = () => (
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
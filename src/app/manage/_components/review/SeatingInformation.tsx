import {Seat, SessionFormData, Tier} from "@/lib/validators/event";
import * as React from "react";
import {GoogleMap, Libraries, Marker, useLoadScript} from "@react-google-maps/api";
import {Armchair, Users} from "lucide-react";
import {getTierColor, getTierName} from "@/lib/utils";
import {SeatingLayout} from "@/app/manage/_components/review/SeatingLayout";

interface SeatingInformationProps {
    isOnline: boolean;
    session: SessionFormData;
    tiers: Tier[];
}

const mapLibraries: Libraries = ["places", "maps"];


export const SeatingInformation: React.FC<SeatingInformationProps> = ({isOnline, session, tiers}) => {
    const {layoutData} = session;
    const {venueDetails} = session;

    // For physical events with coordinates, prepare Google Map
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    const {isLoaded} = useLoadScript({
        googleMapsApiKey,
        libraries: mapLibraries,
    });

    const mapCenter = venueDetails?.latitude && venueDetails?.longitude
        ? {lat: venueDetails.latitude, lng: venueDetails.longitude}
        : {lat: 6.9271, lng: 79.8612}; // Default: Colombo, Sri Lanka

    // Function to count seats by tier
    const getSeatCountByTier = () => {
        const tierCounts: Record<string, number> = {};

        layoutData.layout.blocks.forEach(block => {
            if (block.rows) {
                // For seated blocks with rows
                block.rows.forEach(row => {
                    row.seats.forEach(seat => {
                        if (seat.status !== 'RESERVED') {
                            const tierId = seat.tierId || 'unassigned';
                            tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                        }
                    });
                });
            } else if (block.seats) {
                // For blocks with direct seats array
                block.seats.forEach(seat => {
                    if (seat.status !== 'RESERVED') {
                        const tierId = seat.tierId || 'unassigned';
                        tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                    }
                });
            } else if (block.capacity && block.type === 'standing_capacity') {
                // For standing blocks
                // Fix the TypeScript error by explicitly typing the block.seats access
                const blockSeats = block.seats as Seat[] | undefined;
                const tierId = blockSeats?.[0]?.tierId || 'unassigned';
                tierCounts[tierId] = (tierCounts[tierId] || 0) + (block.capacity || 0);
            }
        });

        return tierCounts;
    };

    const seatCountByTier = getSeatCountByTier();
    const totalSeats = Object.values(seatCountByTier).reduce((sum, count) => sum + count, 0);

    // Display for online events
    if (isOnline) {
        return (
            <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5"/>
                    <span className="font-medium">Capacity Information</span>
                </div>
                <div className="text-sm ml-6">
                    <p>Total capacity: {totalSeats}</p>
                    {Object.entries(seatCountByTier).map(([tierId, count]) => (
                        <div key={tierId} className="flex items-center gap-2 mt-1">
                            {tierId !== 'unassigned' && (
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: getTierColor(tierId, session, tiers)
                                    }}
                                />
                            )}
                            <span>
                                {getTierName(tierId, session, tiers)}: {count} {count === 1 ? 'seat' : 'seats'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Display for physical events - side by side layout
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Venue & Seating Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: Google Map */}
                <div className="h-[300px] rounded-md overflow-hidden border">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{
                                width: '100%',
                                height: '100%',
                            }}
                            center={mapCenter}
                            zoom={15}
                        >
                            <Marker position={mapCenter}/>
                        </GoogleMap>
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Loading map...</p>
                        </div>
                    )}
                </div>

                {/* Right side: Seating summary */}
                <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                            <Armchair className="h-4 w-4 text-muted-foreground mt-0.5"/>
                            <span className="font-medium">Seating Summary</span>
                        </div>
                        <div className="text-sm ml-6">
                            <p>Total capacity: {totalSeats}</p>
                            {Object.entries(seatCountByTier).map(([tierId, count]) => (
                                <div key={tierId} className="flex items-center gap-2 mt-1">
                                    {tierId !== 'unassigned' && (
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: getTierColor(tierId, session, tiers)
                                            }}
                                        />
                                    )}
                                    <span>
                                        {getTierName(tierId, session, tiers)}: {count} {count === 1 ? 'seat' : 'seats'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seating Layout below the map and summary */}
            {layoutData && (
                <SeatingLayout session={session} tiers={tiers}/>
            )}
        </div>
    );
};
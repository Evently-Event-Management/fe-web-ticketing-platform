"use client";

import {Seat, SessionFormData, Tier} from "@/lib/validators/event";
import * as React from "react";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import {Armchair, Users} from "lucide-react";
import {getTierColor, getTierName} from "@/lib/utils";
import {SeatingLayout} from "@/app/manage/_components/review/SeatingLayout";
import "leaflet/dist/leaflet.css";
import L, {LatLngTuple} from "leaflet";

interface SeatingInformationProps {
    isOnline: boolean;
    session: SessionFormData;
    tiers: Tier[];
}

// Fix default marker icons (Leaflet requires this in React/Next.js setups)
const defaultIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export const SeatingInformation: React.FC<SeatingInformationProps> = ({
                                                                          isOnline,
                                                                          session,
                                                                          tiers,
                                                                      }) => {
    const {layoutData} = session;
    const {venueDetails} = session;

    const mapCenter: LatLngTuple =
        venueDetails?.latitude && venueDetails?.longitude
            ? [venueDetails.latitude, venueDetails.longitude]
            : [6.9271, 79.8612]; // Colombo

    // Function to count seats by tier
    const getSeatCountByTier = () => {
        const tierCounts: Record<string, number> = {};

        layoutData.layout.blocks.forEach((block) => {
            if (block.rows) {
                block.rows.forEach((row) => {
                    row.seats.forEach((seat) => {
                        if (seat.status !== "RESERVED") {
                            const tierId = seat.tierId || "unassigned";
                            tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                        }
                    });
                });
            } else if (block.seats) {
                block.seats.forEach((seat) => {
                    if (seat.status !== "RESERVED") {
                        const tierId = seat.tierId || "unassigned";
                        tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                    }
                });
            } else if (block.capacity && block.type === "standing_capacity") {
                const blockSeats = block.seats as Seat[] | undefined;
                const tierId = blockSeats?.[0]?.tierId || "unassigned";
                tierCounts[tierId] =
                    (tierCounts[tierId] || 0) + (block.capacity || 0);
            }
        });

        return tierCounts;
    };

    const seatCountByTier = getSeatCountByTier();
    const totalSeats = Object.values(seatCountByTier).reduce(
        (sum, count) => sum + count,
        0
    );

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
                            {tierId !== "unassigned" && (
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: getTierColor(tierId, session, tiers),
                                    }}
                                />
                            )}
                            <span>
                                {getTierName(tierId, session, tiers)}: {count}{" "}
                                {count === 1 ? "seat" : "seats"}
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
                {/* Left side: Leaflet Map */}
                <div className="h-[300px] rounded-md overflow-hidden border">
                    <MapContainer
                        center={mapCenter}
                        zoom={15}
                        style={{width: "100%", height: "100%"}}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={mapCenter}>
                            <Popup>
                                {venueDetails?.name || "Event Venue"}
                            </Popup>
                        </Marker>
                    </MapContainer>
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
                                    {tierId !== "unassigned" && (
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: getTierColor(tierId, session, tiers),
                                            }}
                                        />
                                    )}
                                    <span>
                                        {getTierName(tierId, session, tiers)}: {count}{" "}
                                        {count === 1 ? "seat" : "seats"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seating Layout below the map and summary */}
            {layoutData && <SeatingLayout session={session} tiers={tiers}/>}
        </div>
    );
};

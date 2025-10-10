// Create a component for displaying seating capacity summary
import {SessionDetailDTO, TierDTO} from "@/lib/validators/event";
import {SessionType} from "@/types/enums/sessionType";
import {Armchair, Users} from "lucide-react";
import {getTierColor, getTierName} from "@/lib/utils";
import React from "react";

export const SeatingCapacitySummary = ({session, tiers}: { session: SessionDetailDTO, tiers: TierDTO[] }) => {
    // Function to count seats by tier
    const getSeatCountByTier = (): Record<string, number> => {
        const {layoutData} = session;
        if (!layoutData || !layoutData.layout || !layoutData.layout.blocks) {
            return {};
        }

        const tierCounts: Record<string, number> = {};

        layoutData.layout.blocks.forEach((block) => {
            if (block.rows && block.rows.length > 0) {
                // Count seats in rows for seated_grid blocks
                block.rows.forEach((row) => {
                    row.seats.forEach((seat) => {
                        if (seat.status !== "RESERVED") {
                            const tierId = seat.tierId || "unassigned";
                            tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                        }
                    });
                });
            } else if (block.seats && block.seats.length > 0) {
                // Count direct seats array (for seated blocks without rows)
                block.seats.forEach((seat) => {
                    if (seat.status !== "RESERVED") {
                        const tierId = seat.tierId || "unassigned";
                        tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                    }
                });
            } else if (block.type === "standing_capacity" && block.capacity) {
                // Get tier for standing capacity blocks
                let tierId = "unassigned";

                // Check if block has seats array with tier information
                if (block.seats && block.seats.length > 0 && block.seats[0].tierId) {
                    tierId = block.seats[0].tierId;
                }

                // Add the capacity to the tier count
                tierCounts[tierId] = (tierCounts[tierId] || 0) + (block.capacity || 0);
            }
        });

        return tierCounts;
    };

    const seatCountByTier = getSeatCountByTier();
    const totalSeats = Object.values(seatCountByTier).reduce((sum: number, count: number) => sum + count, 0);

    return (
        <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
                {session.sessionType === SessionType.ONLINE ? (
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5"/>
                ) : (
                    <Armchair className="h-4 w-4 text-muted-foreground mt-0.5"/>
                )}
                <span className="font-medium">Capacity Information</span>
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="font-medium">Total capacity: {totalSeats}</div>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(seatCountByTier).map(([tierId, count]) => (
                        <div key={tierId} className="flex items-center gap-2">
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
    );
};
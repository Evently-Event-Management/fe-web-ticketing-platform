'use client';

import {SessionDetailDTO, TierDTO} from "@/lib/validators/event";
import * as React from "react";
import {CustomSeatingLayout} from "./CustomSeatingLayout";
import {SeatingCapacitySummary} from "./seatingCapacitySummary";
import {
    SeatStatusSummary
} from "@/app/manage/organization/[organization_id]/event/[eventId]/sessions/[sessionId]/_components/SeatStatusSummary";

interface SessionSeatingLayoutProps {
    session: SessionDetailDTO;
    tiers: TierDTO[];
}

export const SessionSeatingLayout: React.FC<SessionSeatingLayoutProps> = ({ session, tiers }) => {
    const { layoutData } = session;
    
    if (!layoutData || !layoutData.layout || layoutData.layout.blocks.length === 0) {
        return null;
    }
    
    return (
        <div className="space-y-6">
            {/* Summaries displayed horizontally */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Capacity summary by tier */}
                <SeatingCapacitySummary session={session} tiers={tiers} />
                
                {/* Status summary */}
                <SeatStatusSummary session={session} />
            </div>
            
            {/* Full-width seating layout with support for booked seats */}
            <div className="w-full">
                <CustomSeatingLayout session={session} tiers={tiers} />
            </div>
        </div>
    );
};
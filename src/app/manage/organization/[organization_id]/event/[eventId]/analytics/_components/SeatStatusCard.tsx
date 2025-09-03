import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ReadModelSeatStatus } from "@/lib/validators/enums";
import { cn } from "@/lib/utils";
import React from "react";

// Maintain the same status config as in SeatStatusSummery.tsx
const statusConfig: Record<ReadModelSeatStatus, { label: string; color: string }> = {
    [ReadModelSeatStatus.AVAILABLE]: { label: "Available", color: "bg-green-500" },
    [ReadModelSeatStatus.BOOKED]: { label: "Booked", color: "bg-red-500" },
    [ReadModelSeatStatus.RESERVED]: { label: "Reserved", color: "bg-yellow-500" },
    [ReadModelSeatStatus.LOCKED]: { label: "Locked", color: "bg-slate-500" },
};

interface SeatStatusCardProps {
    seatStatusBreakdown: Record<ReadModelSeatStatus, number>;
}

export const SeatStatusCard: React.FC<SeatStatusCardProps> = ({ seatStatusBreakdown }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seat Status</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
                {Object.entries(seatStatusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn("h-2 w-2 rounded-full flex-shrink-0", statusConfig[status as ReadModelSeatStatus].color)}
                            />
                            <span className="text-muted-foreground">
                                {statusConfig[status as ReadModelSeatStatus].label}
                            </span>
                        </div>
                        <span className="font-medium">{count.toLocaleString()}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

// Define SeatStatusSummary component inline to avoid import issues
import * as React from "react";
import {SeatStatus} from "@/types/enums/SeatStatus";
import {SessionType} from "@/types/enums/sessionType";
import {Armchair, Users} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {SessionDetailDTO} from "@/lib/validators/event";

interface SeatStatusSummaryProps {
    session: SessionDetailDTO;
}

export const SeatStatusSummary: React.FC<SeatStatusSummaryProps> = ({session}) => {
    // Function to count seats by status
    const getSeatCountByStatus = (): Record<string, number> => {
        const {layoutData} = session;
        if (!layoutData || !layoutData.layout || !layoutData.layout.blocks) {
            return {};
        }

        const statusCounts: Record<string, number> = {
            [SeatStatus.AVAILABLE]: 0,
            [SeatStatus.RESERVED]: 0,
            [SeatStatus.BOOKED]: 0,
        };

        layoutData.layout.blocks.forEach((block) => {
            if (block.rows && block.rows.length > 0) {
                // Count seats in rows for seated_grid blocks
                block.rows.forEach((row) => {
                    row.seats.forEach((seat) => {
                        const status = seat.status || SeatStatus.AVAILABLE;
                        statusCounts[status] = (statusCounts[status] || 0) + 1;
                    });
                });
            } else if (block.seats && block.seats.length > 0) {
                // Count direct seats array (for seated blocks without rows)
                block.seats.forEach((seat) => {
                    const status = seat.status || SeatStatus.AVAILABLE;
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
            } else if (block.type === "standing_capacity" && block.capacity) {
                // For standing capacity blocks, all seats are considered available unless specified
                statusCounts[SeatStatus.AVAILABLE] =
                    (statusCounts[SeatStatus.AVAILABLE] || 0) + (block.capacity || 0);
            }
        });

        return statusCounts;
    };

    const seatCountByStatus = getSeatCountByStatus();
    const totalSeats = Object.values(seatCountByStatus).reduce((sum: number, count: number) => sum + count, 0);

    const getStatusColor = (status: string): string => {
        switch (status) {
            case SeatStatus.AVAILABLE:
                return "bg-emerald-500";
            case SeatStatus.RESERVED:
                return "bg-amber-500";
            case SeatStatus.BOOKED:
                return "bg-blue-500";
            default:
                return "bg-gray-400";
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
        switch (status) {
            case SeatStatus.AVAILABLE:
                return "default";
            case SeatStatus.RESERVED:
                return "secondary";
            case SeatStatus.BOOKED:
                return "outline";
            default:
                return "outline";
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case SeatStatus.AVAILABLE:
                return "Available";
            case SeatStatus.RESERVED:
                return "Reserved";
            case SeatStatus.BOOKED:
                return "Booked";
            default:
                return status;
        }
    };

    return (
        <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
                {session.sessionType === SessionType.ONLINE ? (
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5"/>
                ) : (
                    <Armchair className="h-4 w-4 text-muted-foreground mt-0.5"/>
                )}
                <span className="font-medium">Seat Status Summary</span>
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="font-medium">Total seats: {totalSeats}</div>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(seatCountByStatus).map(([status, count]) => (
                        count > 0 && (
                            <div key={status} className="flex items-center gap-2">
                                <div
                                    className={`h-3 w-3 rounded-full ${getStatusColor(status)}`}
                                />
                                <span>
                                    <Badge variant={getStatusVariant(status)}>
                                        {getStatusLabel(status)}: {count}
                                    </Badge>
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};
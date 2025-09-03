import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SessionSeatingMapDTO} from "@/types/event";
import {ReadModelSeatStatus} from "@/lib/validators/enums";
import {useMemo} from "react";
import {cn} from "@/lib/utils";

const statusConfig: Record<ReadModelSeatStatus, { label: string; color: string }> = {
    [ReadModelSeatStatus.AVAILABLE]: {label: "Available", color: "bg-green-500"},
    [ReadModelSeatStatus.BOOKED]: {label: "Booked", color: "bg-red-500"},
    [ReadModelSeatStatus.RESERVED]: {label: "Reserved", color: "bg-yellow-500"},
    [ReadModelSeatStatus.LOCKED]: {label: "Locked", color: "bg-slate-500"},
};

export const SeatStatusSummary = ({seatingMap}: { seatingMap: SessionSeatingMapDTO }) => {
    const stats = useMemo(() => {
        const counts = {
            [ReadModelSeatStatus.AVAILABLE]: 0,
            [ReadModelSeatStatus.BOOKED]: 0,
            [ReadModelSeatStatus.RESERVED]: 0,
            [ReadModelSeatStatus.LOCKED]: 0,
        };
        let totalSeats = 0;

        seatingMap.layout.blocks.forEach(block => {
            if (block.rows && block.rows.length > 0) {
                block.rows.forEach(row => {
                    row.seats.forEach(seat => {
                        totalSeats++;
                        const status = seat.status || ReadModelSeatStatus.AVAILABLE;
                        if (counts[status] !== undefined) {
                            counts[status]++;
                        }
                    });
                });
            } else if (block.seats && block.seats.length > 0) {
                block.seats.forEach(seat => {
                    totalSeats++;
                    const status = seat.status || ReadModelSeatStatus.AVAILABLE;
                    if (counts[status] !== undefined) {
                        counts[status]++;
                    }
                });
            }
        });

        return {counts, totalSeats};
    }, [seatingMap]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Seat Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(stats.counts).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2">
                            <span
                                className={cn("h-3 w-3 rounded-full flex-shrink-0", statusConfig[status as ReadModelSeatStatus].color)}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-muted-foreground truncate">
                                    {statusConfig[status as ReadModelSeatStatus].label}
                                </div>
                                <div className="font-semibold text-foreground">
                                    {count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center border-t pt-4 mt-4">
                    <span className="font-semibold text-muted-foreground">Total Seats</span>
                    <span className="font-bold text-foreground text-lg">{stats.totalSeats}</span>
                </div>
            </CardContent>
        </Card>
    );
};
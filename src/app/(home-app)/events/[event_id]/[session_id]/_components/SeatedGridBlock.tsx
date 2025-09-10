import {SeatDTO, SeatingBlockDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {ReadModelSeatStatus} from "@/lib/validators/enums";
import {TooltipContent, TooltipTrigger, Tooltip} from "@/components/ui/tooltip";
import {Lock, X, Clock} from "lucide-react";

export const SeatedGridBlock = ({block, selectedSeats, onSeatSelect}: {
    block: SeatingBlockDTO;
    selectedSeats?: string[];
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void;
}) => (
    <>
        <div className="text-sm font-medium mb-2 text-center text-foreground">{block.name}</div>
        <div
            className="grid gap-1.5"
            style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, auto)`}}
        >
            {block.rows?.map(row =>
                row.seats.map(seat => {
                    const seatStatus = seat.status || ReadModelSeatStatus.AVAILABLE;
                    const isDisabled = seatStatus !== ReadModelSeatStatus.AVAILABLE;
                    const isSelected = !!selectedSeats?.some(s => s === seat.id);

                    // Get status-specific styling
                    const getStatusStyles = () => {
                        switch(seatStatus) {
                            case ReadModelSeatStatus.AVAILABLE:
                                return "cursor-pointer hover:brightness-105";
                            case ReadModelSeatStatus.LOCKED:
                                return "bg-amber-200 text-amber-900 cursor-not-allowed border-amber-500 border";
                            case ReadModelSeatStatus.RESERVED:
                                return "bg-red-200 text-red-900 cursor-not-allowed border-red-500 border";
                            case ReadModelSeatStatus.BOOKED:
                                return "bg-gray-300 text-gray-700 cursor-not-allowed";
                            default:
                                return "opacity-30 cursor-not-allowed";
                        }
                    };

                    // Get status icon
                    const StatusIcon = () => {
                        switch(seatStatus) {
                            case ReadModelSeatStatus.LOCKED:
                                return <Lock className="absolute top-0 right-0 h-2.5 w-2.5 text-amber-600" />;
                            case ReadModelSeatStatus.RESERVED:
                                return <X className="absolute top-0 right-0 h-2.5 w-2.5 text-red-600" />;
                            case ReadModelSeatStatus.BOOKED:
                                return <Clock className="absolute top-0 right-0 h-2.5 w-2.5 text-gray-600" />;
                            default:
                                return null;
                        }
                    };

                    return (
                        <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className={cn(
                                            "h-6 w-6 p-0 rounded-full text-xs font-mono transition-transform duration-200 hover:scale-110",
                                            getStatusStyles(),
                                            isSelected && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                                        )}
                                        style={{
                                            backgroundColor: seatStatus === ReadModelSeatStatus.AVAILABLE && seat.tier
                                                ? `${seat.tier.color}80`
                                                : undefined
                                        }}
                                        disabled={isDisabled || !onSeatSelect}
                                        onClick={() => onSeatSelect?.(seat, block.name)}
                                    >
                                        {seat.label}
                                    </Button>
                                    <StatusIcon />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top"
                                            className="p-2 shadow-md border-border bg-popover">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            seatStatus === ReadModelSeatStatus.LOCKED
                                                ? 'warning'
                                                : seatStatus === ReadModelSeatStatus.RESERVED || seatStatus === ReadModelSeatStatus.BOOKED
                                                    ? 'destructive'
                                                    : 'outline'
                                        }
                                        className="text-xs px-1"
                                    >
                                        {seatStatus === ReadModelSeatStatus.LOCKED
                                            ? 'PAYMENT PROCESSING'
                                            : seatStatus.replace('_', ' ')}
                                    </Badge>
                                    {seat.tier && (
                                        <>
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 rounded-full"
                                                     style={{backgroundColor: seat.tier.color}}/>
                                                <span className="text-xs text-foreground">{seat.tier.name}</span>
                                            </div>
                                            <span
                                                className="text-xs font-medium text-foreground">{new Intl.NumberFormat('en-LK', {
                                                style: 'currency',
                                                currency: 'LKR'
                                            }).format(seat.tier.price)}</span>
                                        </>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })
            )}
        </div>
    </>
);

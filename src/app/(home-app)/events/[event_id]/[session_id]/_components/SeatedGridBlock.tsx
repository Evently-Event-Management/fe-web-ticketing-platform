import {SeatDTO, SeatingBlockDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {ReadModelSeatStatus} from "@/lib/validators/enums";
import {TooltipContent, TooltipTrigger, Tooltip} from "@/components/ui/tooltip";

export const SeatedGridBlock = ({block, selectedSeats, onSeatSelect}: {
    block: SeatingBlockDTO;
    selectedSeats?: string[];
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void;
}) => (
    <>
        <div className="text-sm font-medium mb-2 text-center text-foreground">{block.name}</div>
        <div
            className="grid gap-1.5"
            style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, minmax(0, 1fr))`}}
        >
            {block.rows?.map(row =>
                row.seats.map(seat => {
                    const seatStatus = seat.status || ReadModelSeatStatus.AVAILABLE;
                    const isDisabled = seatStatus !== ReadModelSeatStatus.AVAILABLE;
                    const isSelected = !!selectedSeats?.some(s => s === seat.id);

                    return (
                        <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={cn(
                                        "h-6 w-6 p-0 rounded-full text-xs font-mono transition-transform duration-200 hover:scale-110",
                                        isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:brightness-105",
                                        isSelected && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                                    )}
                                    style={{backgroundColor: seat.tier ? `${seat.tier.color}80` : undefined}}
                                    disabled={isDisabled || !onSeatSelect}
                                    onClick={() => onSeatSelect?.(seat, block.name)}
                                >
                                    {seat.label}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top"
                                            className="p-2 shadow-md border-border bg-popover">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={isDisabled ? 'destructive' : 'outline'}
                                        className="text-xs px-1"
                                    >
                                        {seatStatus.replace('_', ' ')}
                                    </Badge>
                                    {seat.tier && (
                                        <>
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 rounded-full"
                                                     style={{backgroundColor: seat.tier.color}}/>
                                                <span className="text-xs">{seat.tier.name}</span>
                                            </div>
                                            <span
                                                className="text-xs font-medium">{new Intl.NumberFormat('en-LK', {
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


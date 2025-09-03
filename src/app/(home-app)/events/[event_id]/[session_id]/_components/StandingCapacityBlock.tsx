import {SeatingBlockDTO, SeatDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";
import {ReadModelSeatStatus} from "@/lib/validators/enums";
import {
    getAvailabilityPercentage,
    getStandingAreaTierColor
} from "@/app/(home-app)/events/[event_id]/_components/utils";


export const StandingCapacityBlock = ({block, selectedSeats, onSeatSelect}: {
    block: SeatingBlockDTO;
    selectedSeats?: string[];
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void;
}) => {
    const availabilityPercentage = getAvailabilityPercentage(block);
    const tierColor = getStandingAreaTierColor(block);
    const availableSeats = block.seats?.filter(seat =>
        (!seat.status || seat.status === ReadModelSeatStatus.AVAILABLE) &&
        !selectedSeats?.some(s => s === seat.id)
    ) || [];
    const isDisabled = availableSeats.length === 0 || !onSeatSelect;
    const handleQuickPick = () => {
        if (isDisabled) return;
        const randomIndex = Math.floor(Math.random() * availableSeats.length);
        const randomSeat = availableSeats[randomIndex];
        onSeatSelect?.(randomSeat, block.name);
    };

    return (
        <div className="relative flex flex-col items-center justify-between h-full w-full p-3">
            <div className="absolute top-0 right-0">
                <Button
                    type="button"
                    size="icon"
                    variant="default"
                    className="h-8 w-8 shadow-xl"
                    disabled={isDisabled}
                    onClick={handleQuickPick}
                >
                    <PlusIcon className="h-5 w-5"/>
                </Button>
            </div>
            <div className="text-center mt-2">
                <p className="font-medium text-foreground">{block.name}</p>
                <p className="text-sm text-muted-foreground">Capacity: {block.capacity || 0}</p>
            </div>
            <div className="w-full my-3 text-center">
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                            width: `${availabilityPercentage}%`,
                            backgroundColor: tierColor || 'hsl(var(--primary))'
                        }}
                    />
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                    {availabilityPercentage > 0 ? `${availabilityPercentage.toFixed(0)}% Available` : 'Sold Out'}
                </p>
            </div>
        </div>
    );
};


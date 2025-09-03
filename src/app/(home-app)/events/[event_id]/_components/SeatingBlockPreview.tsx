import {SeatingBlockDTO} from "@/types/event";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {
    getAvailabilityPercentage,
    getStandingAreaTierColor
} from "@/app/(home-app)/events/[event_id]/_components/utils";

const SeatingBlockPreview = ({block}: { block: SeatingBlockDTO }) => {
    const blockContent = () => {
        switch (block.type) {
            case 'seated_grid':
                return (
                    <>
                        <div className="text-sm font-medium mb-2 text-foreground">{block.name}</div>
                        <div
                            className="grid gap-1.5 justify-center" // Centering the grid horizontally
                            style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, auto)`}} // <-- THE FIX
                        >
                            {block.rows?.map(row =>
                                row.seats.map(seat => (
                                    <Popover key={seat.id}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 rounded-full text-xs font-mono transition-transform duration-200 hover:scale-110 hover:brightness-105"
                                                style={{
                                                    backgroundColor: seat.tier ? `${seat.tier.color}80` : undefined,
                                                    opacity: seat.status === 'RESERVED' || seat.status === 'BOOKED' ? 0.3 : 1,
                                                    cursor: seat.status === 'RESERVED' || seat.status === 'BOOKED' ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={seat.status === 'RESERVED' || seat.status === 'BOOKED'}
                                            >
                                                {seat.label}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent side="top" className="w-60 p-0 shadow-xl">
                                            <div className="p-4">
                                                <div className="font-semibold mb-3 text-foreground">Seat Information
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between"><span
                                                        className="text-muted-foreground">Block:</span><span>{block.name}</span>
                                                    </div>
                                                    <div className="flex justify-between"><span
                                                        className="text-muted-foreground">Row:</span><span>{row.label}</span>
                                                    </div>
                                                    <div className="flex justify-between"><span
                                                        className="text-muted-foreground">Seat:</span><span>{seat.label}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center"><span
                                                        className="text-muted-foreground">Status:</span>
                                                        <Badge
                                                            variant={seat.status === 'RESERVED' || seat.status === 'BOOKED' ? 'destructive' : 'outline'}>
                                                            {seat.status?.replace('_', ' ') || 'Available'}
                                                        </Badge>
                                                    </div>
                                                    {seat.tier &&
                                                        <div className="flex justify-between items-center"><span
                                                            className="text-muted-foreground">Tier:</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-3 w-3 rounded-full border"
                                                                     style={{backgroundColor: seat.tier.color}}/>
                                                                <span>{seat.tier.name}</span>
                                                            </div>
                                                        </div>}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ))
                            )}
                        </div>
                    </>
                );

            case 'standing_capacity':
                const availabilityPercentage = getAvailabilityPercentage(block);
                getStandingAreaTierColor(block);
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="font-medium text-foreground">{block.name}</p>
                        <p className="text-sm text-muted-foreground">
                            Capacity: {block.capacity || 0}
                        </p>

                        {/* Availability indicator */}
                        <Progress value={availabilityPercentage} className="w-full mt-2 h-3 rounded-full"/>
                        <p className="text-xs mt-1 text-muted-foreground">
                            {availabilityPercentage.toFixed(0)}% Available
                        </p>
                    </div>
                );

            case 'non_sellable':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground font-medium">{block.name}</p>
                    </div>
                );

            default:
                return null;
        }
    };

    // Get background color based on block type
    const getBlockBackgroundColor = (block: SeatingBlockDTO) => {
        if (block.type === 'standing_capacity') {
            const tierColor = getStandingAreaTierColor(block);
            return tierColor ? `${tierColor}40` : undefined; // Light opacity for background
        }
        return undefined;
    };

    return (
        <div
            className="absolute bg-card/80 backdrop-blur-sm border rounded-lg p-3 shadow-md"
            style={{
                left: block.position.x,
                top: block.position.y,
                width: block.width ? `${block.width}px` : 'auto',
                height: block.height ? `${block.height}px` : 'auto',
                borderStyle: block.type === 'non_sellable' ? 'dashed' : 'solid',
                backgroundColor: getBlockBackgroundColor(block)
            }}
        >
            {blockContent()}
        </div>
    );
};

export default SeatingBlockPreview;
import {SeatingBlockDTO} from "@/types/event";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

const SeatingBlockPreview = ({block}: { block: SeatingBlockDTO }) => {
    // Calculate availability percentage for standing capacity blocks
    const getAvailabilityPercentage = (block: SeatingBlockDTO) => {
        if (block.type !== 'standing_capacity' || !block.capacity) return 100;

        // Count reserved/booked/locked seats if available
        const reservedCount = block.seats?.filter(seat =>
            seat.status === 'RESERVED' ||
            seat.status === 'BOOKED' ||
            seat.status === 'LOCKED'
        ).length || 0;

        // Calculate available percentage
        return Math.max(0, Math.min(100, ((block.capacity - reservedCount) / block.capacity) * 100));
    };

    // Get the tier color for standing capacity blocks
    const getStandingAreaTierColor = (block: SeatingBlockDTO) => {
        if (block.type !== 'standing_capacity') return undefined;

        // Find first seat with tier info or return undefined
        return block.seats?.[0]?.tier?.color;
    };

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
                const tierColor = getStandingAreaTierColor(block);

                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="font-medium text-foreground">{block.name}</p>
                        <p className="text-sm text-muted-foreground">
                            Capacity: {block.capacity || 0}
                        </p>

                        {/* Availability indicator */}
                        <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                                className="h-2.5 rounded-full transition-all"
                                style={{
                                    width: `${availabilityPercentage}%`,
                                    backgroundColor: tierColor || 'hsl(var(--primary))'
                                }}
                            ></div>
                        </div>

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
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {SessionSeatingMapDTO, SeatingBlockDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

// A dedicated component for rendering different types of seating blocks.
const SeatingBlock = ({block}: { block: SeatingBlockDTO }) => {
    const blockContent = () => {
        switch (block.type) {
            case 'seated_grid':
                return (
                    <>
                        <div className="text-sm font-medium mb-2 text-foreground">{block.name}</div>
                        <div
                            className="grid gap-1.5"
                            style={{gridTemplateColumns: `repeat(${block.rows?.[0]?.seats?.length || 1}, minmax(0, 1fr))`}}
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
                                                    opacity: seat.status === 'RESERVED' ? 0.3 : 1,
                                                    cursor: seat.status === 'RESERVED' ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={seat.status === 'RESERVED'}
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
                                                            variant={seat.status === 'RESERVED' ? 'destructive' : 'outline'}>
                                                            {seat.status || 'Available'}
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
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="font-medium text-foreground">{block.name}</p>
                        <p className="text-sm text-muted-foreground">Capacity: {block.capacity || 0}</p>
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

    return (
        <div
            className="absolute bg-card/80 backdrop-blur-sm border rounded-lg p-3 shadow-md"
            style={{
                left: block.position.x,
                top: block.position.y,
                width: block.width ? `${block.width}px` : 'auto',
                height: block.height ? `${block.height}px` : 'auto',
                // Add a dashed border for non-sellable areas for better visual distinction
                borderStyle: block.type === 'non_sellable' ? 'dashed' : 'solid'
            }}
        >
            {blockContent()}
        </div>
    );
};


export const SeatingLayout = ({seatingMap}: { seatingMap: SessionSeatingMapDTO }) => {
    return (
        <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Seating Layout: {seatingMap.name}</h3>
            <div
                className="relative min-h-[400px] p-4 rounded-lg overflow-auto"
                // Elegant dot-grid background
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}
            >
                {seatingMap.layout.blocks.map(block => (
                    <SeatingBlock key={block.id} block={block}/>
                ))}
            </div>
        </div>
    );
};
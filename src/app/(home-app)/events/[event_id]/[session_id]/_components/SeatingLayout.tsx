import {SeatDTO, SessionSeatingMapDTO} from "@/types/event";
import {SeatingBlock} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/SeatingBlock";
import {normalizeSeatingLayout} from "@/lib/seatingLayoutUtils";


export const SeatingLayout = ({
                                  seatingMap,
                                  selectedSeats,
                                  onSeatSelect,
                              }: {
    seatingMap: SessionSeatingMapDTO;
    selectedSeats?: string[]; // Make optional for reuse
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void; // Make optional for reuse
}) => {
    const {blocks, canvasWidth, canvasHeight} = normalizeSeatingLayout(seatingMap.layout.blocks);
    const enforcedMinHeight = Math.max(canvasHeight, 480);

    return (
        <div className="border rounded-lg p-4 bg-background/50">
            <h3 className="font-semibold mb-4 text-foreground">Seating Layout: {seatingMap.name}</h3>
            <div
                className="relative rounded-lg overflow-x-auto"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                    minHeight: `${enforcedMinHeight}px`
                }}
            >
                <div
                    className="relative mx-auto"
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`
                    }}
                >
                    {blocks.map(block => (
                        <SeatingBlock
                            key={block.id}
                            block={block}
                            selectedSeats={selectedSeats}
                            onSeatSelect={onSeatSelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

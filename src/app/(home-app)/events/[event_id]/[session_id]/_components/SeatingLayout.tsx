import {SeatDTO, SessionSeatingMapDTO} from "@/types/event";
import {SeatingBlock} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/SeatingBlock";


const SEAT_HEIGHT_PX = 30;
const ROW_GAP_PX = 6;

export const SeatingLayout = ({
                                  seatingMap,
                                  selectedSeats,
                                  onSeatSelect,
                              }: {
    seatingMap: SessionSeatingMapDTO;
    selectedSeats?: string[]; // Make optional for reuse
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void; // Make optional for reuse
}) => {
    // Find the furthest y coordinate plus the height of the block to determine the container height
    const calculateRequiredHeight = () => {
        let maxBottom = 0;

        seatingMap.layout.blocks.forEach(block => {
            let blockHeight = 0;

            // ✅ Check the block type to determine how to calculate its height
            if (block.type === 'seated_grid') {
                const numRows = block.rows?.length || 0;
                if (numRows > 0) {
                    const totalSeatsHeight = numRows * SEAT_HEIGHT_PX;
                    const totalGapsHeight = (numRows - 1) * ROW_GAP_PX;
                    blockHeight = totalSeatsHeight + totalGapsHeight;
                }
            } else {
                // Fallback for other block types like 'standing_capacity'
                blockHeight = block.height || 0;
            }

            const bottom = block.position.y + blockHeight;
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        });

        // Add padding to ensure blocks aren't cut off
        return maxBottom + 50;
    };

    const containerHeight = calculateRequiredHeight();

    return (
        <div className="border rounded-lg p-4 bg-background/50">
            <h3 className="font-semibold mb-4 text-foreground">Seating Layout: {seatingMap.name}</h3>
            <div
                className="relative p-4 rounded-lg overflow-x-auto"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                    height: `${containerHeight}px`,
                    overflowY: 'hidden'
                }}
            >
                {seatingMap.layout.blocks.map(block => (
                    <SeatingBlock
                        key={block.id}
                        block={block}
                        selectedSeats={selectedSeats}
                        onSeatSelect={onSeatSelect}
                    />
                ))}
            </div>
        </div>
    );
};

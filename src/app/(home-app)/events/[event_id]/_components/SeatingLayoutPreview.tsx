import {SessionSeatingMapDTO} from "@/types/event";
import SeatingBlockPreview from "@/app/(home-app)/events/[event_id]/_components/SeatingBlockPreview";
import {normalizeSeatingLayout} from "@/lib/seatingLayoutUtils";

export const SeatingLayoutPreview = ({seatingMap}: { seatingMap: SessionSeatingMapDTO }) => {
    const {blocks, canvasWidth, canvasHeight} = normalizeSeatingLayout(seatingMap.layout.blocks);
    const enforcedMinHeight = Math.max(canvasHeight, 400);

    return (
        <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-4 text-foreground">Seating Layout: {seatingMap.name}</h3>
            <div
                className="relative rounded-lg overflow-auto"
                style={{
                    minHeight: `${enforcedMinHeight}px`,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}
            >
                <div
                    className="relative mx-auto"
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                    }}
                >
                    {blocks.map(block => (
                        <SeatingBlockPreview key={block.id} block={block}/>
                    ))}
                </div>
            </div>
        </div>
    );
};
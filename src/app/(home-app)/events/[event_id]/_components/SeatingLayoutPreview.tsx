import {SessionSeatingMapDTO} from "@/types/event";
import SeatingBlockPreview from "@/app/(home-app)/events/[event_id]/_components/SeatingBlockPreview";

export const SeatingLayoutPreview = ({seatingMap}: { seatingMap: SessionSeatingMapDTO }) => {
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
                    <SeatingBlockPreview key={block.id} block={block}/>
                ))}
            </div>
        </div>
    );
};
import {Block} from "@/app/manage/organization/[organization_id]/seating/create/_lib/types";
import {useDraggable} from "@dnd-kit/core";
import {GripVertical, Settings} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CSS} from '@dnd-kit/utilities';


export function DraggableBlock({block, onSelect}: { block: Block; onSelect: (block: Block) => void; }) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: block.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: block.position.x,
        top: block.position.y,
    };

    const renderSeats = () => {
        if (block.type !== 'seated_grid' || !block.rows || !block.columns) return null;
        const seatCount = block.rows * block.columns;
        const displayCount = Math.min(seatCount, 100); // Limit rendered seats for performance

        return (
            // ✅ Dynamically set grid columns based on block properties
            <div
                className="grid gap-1 mt-2"
                style={{gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))`}}
            >
                {Array.from({length: displayCount}).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-muted-foreground/50 rounded-full"/>
                ))}
            </div>
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="absolute p-3 bg-card border rounded-lg shadow-md cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start gap-2">
                <GripVertical {...listeners} {...attributes} className="text-muted-foreground mt-1"/>
                <div className="flex flex-col text-center">
                    <span className="text-sm font-medium">{block.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {block.type === 'seated_grid' ? `${block.rows}x${block.columns}` : null}
                    </span>
                    {renderSeats()}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSelect(block)}>
                    <Settings className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
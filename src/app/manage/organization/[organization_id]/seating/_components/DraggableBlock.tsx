import {useDraggable} from "@dnd-kit/core";
import {GripVertical, Settings} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CSS} from '@dnd-kit/utilities';
import {LayoutBlock} from "@/types/seatingLayout";
import {getRowIndex, getRowLabel} from "@/app/manage/organization/[organization_id]/seating/create/_lib/getRowLabel";


export function DraggableBlock({ block, onSelect }: { block: LayoutBlock; onSelect: (block: LayoutBlock) => void; }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: block.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: block.position.x,
        top: block.position.y,
    };

    const renderSeats = () => {
        // This type guard ensures that for 'seated_grid', rows and columns are numbers.
        if (block.type !== 'seated_grid' || !block.rows || !block.columns) {
            return null;
        }

        // ✅ By destructuring here, TypeScript correctly infers the narrowed types.
        const { rows, columns, startRowLabel, startColumnLabel } = block;

        const startRowIndex = getRowIndex(startRowLabel || 'A');
        const startCol = startColumnLabel || 1;

        return (
            <div className="grid gap-2 mt-2 p-2 bg-muted/50 rounded-md" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className="w-3.5 h-3.5 flex items-center justify-center bg-muted-foreground/50 rounded-full text-xs text-muted-foreground border" title={`${getRowLabel(startRowIndex + rowIndex)}${startCol + colIndex}`}>
                            {colIndex === 0 && <span className="absolute -left-5 text-xs">{getRowLabel(startRowIndex + rowIndex)}</span>}
                            {rowIndex === 0 && <span className="absolute -top-5 text-xs">{startCol + colIndex}</span>}
                        </div>
                    ))
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
                <GripVertical {...listeners} {...attributes} className="text-muted-foreground mt-1" />
                <div className="flex flex-col text-center">
                    <span className="text-sm font-medium">{block.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {block.type === 'seated_grid' ? `${block.rows}x${block.columns}` : null}
                    </span>
                    {renderSeats()}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSelect(block)}>
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
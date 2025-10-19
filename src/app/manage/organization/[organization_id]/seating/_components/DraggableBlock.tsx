import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSS } from '@dnd-kit/utilities';
import { LayoutBlock } from "@/types/seatingLayout";
import { getRowIndex, getRowLabel } from "@/app/manage/organization/[organization_id]/seating/create/_lib/getRowLabel";
import { DEFAULTS, estimateBlockDimensions } from "@/lib/seatingLayoutUtils";


export function DraggableBlock({ block, onSelect }: { block: LayoutBlock; onSelect: (block: LayoutBlock) => void; }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: block.id,
    });

    const { width, height } = estimateBlockDimensions(block);

    const style = {
        transform: CSS.Translate.toString(transform),
        left: block.position.x,
        top: block.position.y,
        width: block.width ?? width,
        height: block.height ?? height,
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
            <div
                className="grid w-full h-full rounded-md bg-muted/50 p-2"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    gap: `${DEFAULTS.seatGap}px`
                }}
            >
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="relative flex h-full w-full items-center justify-center rounded-full border bg-muted-foreground/50 text-xs text-muted-foreground"
                            title={`${getRowLabel(startRowIndex + rowIndex)}${startCol + colIndex}`}
                        >
                            {colIndex === 0 && (
                                <span className="absolute -left-5 text-xs">
                                    {getRowLabel(startRowIndex + rowIndex)}
                                </span>
                            )}
                            {rowIndex === 0 && (
                                <span className="absolute -top-5 text-xs">{startCol + colIndex}</span>
                            )}
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
            className="absolute flex flex-col p-3 bg-card border rounded-lg shadow-md cursor-grab active:cursor-grabbing"
        >
            {/* Header row with grip, title and settings */}
            <div className="flex items-center justify-between w-full mb-2">
                <GripVertical {...listeners} {...attributes} className="text-muted-foreground h-4 flex-shrink-0 mr-1" />
                <div className="flex flex-col text-center overflow-hidden flex-grow mx-1">
                    <span className="text-sm font-medium truncate" title={block.name}>{block.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                        {block.type === 'seated_grid' ? `${block.rows}x${block.columns}` : null}
                    </span>
                </div>
                <Button type={'button'} variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => onSelect(block)}>
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            {/* Seats row - takes remaining height */}
            <div className="flex-grow h-full min-h-0 w-full p-4">
                {renderSeats()}
            </div>
        </div>
    );
}
import {Block} from "@/app/manage/organization/[organization_id]/seating/create/_lib/types";
import {useDraggable} from "@dnd-kit/core";
import {CSS} from '@dnd-kit/utilities';
import {Button} from "@/components/ui/button";
import {GripVertical, MoveDiagonal2, Settings} from "lucide-react";
import {ResizableBox} from "react-resizable";


export function ResizableDraggableBlock({ block, onSelect, onResize }: { block: Block; onSelect: (block: Block) => void; onResize: (blockId: string, size: { width: number; height: number }) => void; }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: block.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: block.position.x,
        top: block.position.y,
    };

    return (
        <div ref={setNodeRef} style={style} className="absolute">
            <ResizableBox
                height={block.height || 100}
                width={block.width || 200}
                minConstraints={[120,70]}
                maxConstraints={[800, 500]}
                onResizeStop={(_, data) => onResize(block.id, data.size)}
                className="p-2 bg-card border rounded-lg shadow-md box-border flex flex-col relative"
            >
                <div className="flex items-center gap-2 flex-grow">
                    <GripVertical {...listeners} {...attributes} className="text-muted-foreground cursor-grab active:cursor-grabbing" />
                    <div className="flex flex-col text-center flex-grow">
                        <span className="text-sm font-medium">{block.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {block.type === 'standing_capacity' ? `${block.capacity} capacity` : null}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSelect(block)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
                <div className="absolute bottom-1 right-1 text-muted-foreground/50 pointer-events-none">
                    <MoveDiagonal2 className="h-3 w-3" />
                </div>
            </ResizableBox>
        </div>
    )
}
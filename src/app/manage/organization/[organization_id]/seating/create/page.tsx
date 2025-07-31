'use client';

import {useState} from "react";
import {Block} from "./_lib/types";
import {DndContext, useDroppable} from "@dnd-kit/core";
import type {BlockType} from "./_lib/types";
import {Button} from "@/components/ui/button";
import {Plus, ZoomIn, ZoomOut} from "lucide-react";
import {DraggableBlock} from "@/app/manage/organization/[organization_id]/seating/create/_components/DraggableBlock";
import {SettingsPanel} from "@/app/manage/organization/[organization_id]/seating/create/_components/SettingsPanel";
import {
    ResizableDraggableBlock
} from "@/app/manage/organization/[organization_id]/seating/create/_components/ResizableDraggableBlock";
import 'react-resizable/css/styles.css';
import {restrictToParentElement} from "@dnd-kit/modifiers";

export default function SeatingLayoutCreatorPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const {setNodeRef} = useDroppable({id: 'canvas'});

    const minZoom = 0.5;
    const maxZoom = 2;

    const addNewBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: `blk_${Date.now()}`,
            name: `New ${type.replace('_', ' ')}`,
            type,
            position: {x: 50, y: 50},
            rows: type === 'seated_grid' ? 5 : undefined,
            columns: type === 'seated_grid' ? 10 : undefined,
            capacity: type === 'standing_capacity' ? 100 : undefined,
            // ✅ Set default dimensions for all resizable block types
            width: type === 'standing_capacity' || type === 'non_sellable' ? 200 : undefined,
            height: type === 'standing_capacity' || type === 'non_sellable' ? 100 : undefined,
        };
        setBlocks(prev => [...prev, newBlock]);
    };

    const handleDragEnd = (event: any) => {
        const {active, delta} = event;
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === active.id
                    ? {
                        ...block,
                        position: {
                            x: block.position.x + delta.x / zoomLevel,
                            y: block.position.y + delta.y / zoomLevel
                        }
                    }
                    : block
            )
        );
    };

    const handleResize = (blockId: string, size: { width: number, height: number }) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId
                    ? {...block, width: size.width, height: size.height}
                    : block
            )
        );
    };

    const handleUpdateBlock = (updatedBlock: Block) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    };

    const handleDeleteBlock = (blockId: string) => {
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        setSelectedBlock(null);
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, maxZoom));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, minZoom));

    return (
        <>
            <style>{`
                .react-resizable-handle {
                    background: hsl(var(--primary));
                    width: 10px;
                    height: 10px;
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    padding: 0;
                    border-radius: 99px;
                    border: 2px solid hsl(var(--background));
                }
            `}</style>
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
                <div className="flex h-full bg-muted/40">
                    {/* Toolbox */}
                    <aside className="w-64 border-r bg-background p-4 flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Toolbox</h2>
                        <Button onClick={() => addNewBlock('seated_grid')}>
                            <Plus className="mr-2 h-4 w-4"/> Seated Block
                        </Button>
                        <Button onClick={() => addNewBlock('standing_capacity')}>
                            <Plus className="mr-2 h-4 w-4"/> Capacity Block
                        </Button>
                        <Button onClick={() => addNewBlock('non_sellable')}>
                            <Plus className="mr-2 h-4 w-4"/> Non-Sellable
                        </Button>
                    </aside>

                    {/* Canvas Wrapper */}
                    <div className="flex-1 relative flex items-center justify-center p-8">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] relative">
                            {/* The static container with the border and background */}
                            <div
                                className="w-full h-full bg-background border rounded-lg shadow-lg overflow-auto relative">
                                {/* The zoomable "stage" inside the container */}
                                <main
                                    ref={setNodeRef}
                                    className="relative"
                                    style={{
                                        width: `${100 / minZoom}%`,
                                        height: `${100 / minZoom}%`,
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    {blocks.map(block => {
                                        // ✅ Render ResizableDraggableBlock for both capacity and non-sellable types
                                        if (block.type === 'standing_capacity' || block.type === 'non_sellable') {
                                            return <ResizableDraggableBlock key={block.id} block={block}
                                                                            onSelect={setSelectedBlock}
                                                                            onResize={handleResize}/>
                                        }
                                        return <DraggableBlock key={block.id} block={block}
                                                               onSelect={setSelectedBlock}/>
                                    })}
                                </main>
                            </div>

                            {/* Zoom Controls are positioned relative to the outer wrapper, so they are not scaled */}
                            <div
                                className="absolute bottom-4 right-4 flex items-center gap-2 bg-background p-2 rounded-lg border shadow-md">
                                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                                    <ZoomOut className="h-4 w-4"/>
                                </Button>
                                <span className="text-sm font-medium w-12 text-center">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                                    <ZoomIn className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    <SettingsPanel
                        selectedBlock={selectedBlock}
                        onUpdate={handleUpdateBlock}
                        onDelete={handleDeleteBlock}
                        onClose={() => setSelectedBlock(null)}
                    />
                </div>
            </DndContext>
        </>
    );
}
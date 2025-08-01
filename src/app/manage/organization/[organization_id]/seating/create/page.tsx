'use client';

import {useState} from "react";
import {Block} from "./_lib/types";
import {DndContext, useDroppable} from "@dnd-kit/core";
import type {BlockType} from "./_lib/types";
import {Button} from "@/components/ui/button";
import {Plus, Save, ZoomIn, ZoomOut} from "lucide-react";
import {DraggableBlock} from "@/app/manage/organization/[organization_id]/seating/create/_components/DraggableBlock";
import {SettingsPanel} from "@/app/manage/organization/[organization_id]/seating/create/_components/SettingsPanel";
import {
    ResizableDraggableBlock
} from "@/app/manage/organization/[organization_id]/seating/create/_components/ResizableDraggableBlock";
import 'react-resizable/css/styles.css';
import {restrictToParentElement} from "@dnd-kit/modifiers";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export default function SeatingLayoutCreatorPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [layoutName, setLayoutName] = useState('Untitled Layout');
    const { setNodeRef } = useDroppable({ id: 'canvas' });

    const minZoom = 0.5;
    const maxZoom = 2;

    const addNewBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: `blk_${Date.now()}`,
            name: `New ${type.replace('_', ' ')}`,
            type,
            position: { x: 50, y: 50 },
            rows: type === 'seated_grid' ? 5 : undefined,
            columns: type === 'seated_grid' ? 10 : undefined,
            startRowLabel: type === 'seated_grid' ? 'A' : undefined,
            startColumnLabel: type === 'seated_grid' ? 1 : undefined,
            capacity: type === 'standing_capacity' ? 100 : undefined,
            width: type === 'standing_capacity' || type === 'non_sellable' ? 200 : undefined,
            height: type === 'standing_capacity' || type === 'non_sellable' ? 100 : undefined,
        };
        setBlocks(prev => [...prev, newBlock]);
    };

    const handleDragEnd = (event: any) => {
        const { active, delta } = event;
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
                    ? { ...block, width: size.width, height: size.height }
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

    const handleSaveLayout = () => {
        if (blocks.length === 0) {
            console.log("Cannot save an empty layout.");
            return;
        }

        const minX = Math.min(...blocks.map(b => b.position.x));
        const minY = Math.min(...blocks.map(b => b.position.y));

        const normalizedBlocks = blocks.map(block => ({
            ...block,
            position: {
                x: block.position.x - minX,
                y: block.position.y - minY,
            },
        }));

        const layoutData = {
            name: layoutName,
            layout: {
                blocks: normalizedBlocks,
            },
        };

        console.log("Saving Normalized Layout:", JSON.stringify(layoutData, null, 2));
    };

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
                    <aside className="w-64 border-r bg-background p-4 flex flex-col">
                        <div className="flex-grow space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="layout-name">Layout Name</Label>
                                <Input
                                    id="layout-name"
                                    value={layoutName}
                                    onChange={(e) => setLayoutName(e.target.value)}
                                    placeholder="e.g., Main Auditorium"
                                />
                            </div>
                            <h2 className="text-lg font-semibold pt-4 border-t">Toolbox</h2>
                            <Button className="w-full justify-start" variant="ghost" onClick={() => addNewBlock('seated_grid')}>
                                <Plus className="mr-2 h-4 w-4" /> Seated Block
                            </Button>
                            <Button className="w-full justify-start" variant="ghost" onClick={() => addNewBlock('standing_capacity')}>
                                <Plus className="mr-2 h-4 w-4" /> Capacity Block
                            </Button>
                            <Button className="w-full justify-start" variant="ghost" onClick={() => addNewBlock('non_sellable')}>
                                <Plus className="mr-2 h-4 w-4" /> Non-Sellable
                            </Button>
                        </div>
                        <div className="mt-auto">
                            <Button className="w-full" onClick={handleSaveLayout}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Layout
                            </Button>
                        </div>
                    </aside>

                    {/* Canvas Wrapper */}
                    <div className="flex-1 relative flex items-center justify-center p-8">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] relative">
                            <div className="w-full h-full bg-background border rounded-lg shadow-lg overflow-auto relative">
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
                                        if (block.type === 'standing_capacity' || block.type === 'non_sellable') {
                                            return <ResizableDraggableBlock key={block.id} block={block} onSelect={setSelectedBlock} onResize={handleResize} />
                                        }
                                        return <DraggableBlock key={block.id} block={block} onSelect={setSelectedBlock} />
                                    })}
                                </main>
                            </div>

                            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background p-2 rounded-lg border shadow-md">
                                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium w-12 text-center">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

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
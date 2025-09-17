'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {DndContext, DragEndEvent, useDroppable} from '@dnd-kit/core';
import {restrictToParentElement} from '@dnd-kit/modifiers';
import 'react-resizable/css/styles.css';

import {LayoutBlock, BlockType, LayoutData} from '@/types/seatingLayout';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {BrushCleaning, Plus, Save, ZoomIn, ZoomOut} from 'lucide-react';

import {DraggableBlock} from './DraggableBlock';
import {ResizableDraggableBlock} from './ResizableDraggableBlock';
import {SettingsPanel} from './SettingsPanel';

interface LayoutEditorProps {
    initialData?: LayoutData;
    onSave: (layoutData: LayoutData) => Promise<void>;
    isLoading?: boolean;
    toolboxPlacement?: 'sidebar' | 'header';
}

export function LayoutEditor({
                                 initialData,
                                 onSave,
                                 isLoading = false,
                                 toolboxPlacement = 'sidebar',
                             }: LayoutEditorProps) {
    const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<LayoutBlock | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [layoutName, setLayoutName] = useState('Untitled Layout');
    const {setNodeRef} = useDroppable({id: 'canvas'});

    useEffect(() => {
        if (initialData) {
            setLayoutName(initialData.name);
            setBlocks(initialData.layout.blocks);
        }
    }, [initialData]);

    const minZoom = 0.5;
    const maxZoom = 2;

    const addNewBlock = (type: BlockType) => {
        const newBlock: LayoutBlock = {
            id: `temp_${Date.now()}`, // Temporary ID
            name: `New ${type.replace('_', ' ')}`,
            type,
            position: {x: 50, y: 50},
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

    // --- Define toolbox buttons once to avoid repetition ---
    const toolButtons: { type: BlockType; label: string }[] = [
        { type: 'seated_grid', label: 'Seated Block' },
        { type: 'standing_capacity', label: 'Capacity Block' },
        { type: 'non_sellable', label: 'Non-Sellable' },
    ];

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, delta} = event;
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === active.id
                    ? {
                        ...block,
                        position: {x: block.position.x + delta.x / zoomLevel, y: block.position.y + delta.y / zoomLevel}
                    }
                    : block
            )
        );
    };

    const handleResize = (blockId: string, size: { width: number; height: number }) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId ? {...block, width: size.width, height: size.height} : block
            )
        );
    };

    const handleUpdateBlock = (updatedBlock: LayoutBlock) => {
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
        const layoutData: LayoutData = {
            name: layoutName,
            layout: {
                blocks: blocks,
            },
        };
        onSave(layoutData).then();
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
                {/* --- HEADER BAR (UPDATED) --- */}
                <div className="bg-background border-b">
                    <div className="px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                            <Input
                                id="header-layout-name"
                                value={layoutName}
                                onChange={(e) => setLayoutName(e.target.value)}
                                placeholder="e.g., Main Auditorium"
                                className="max-w-xs"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button type={'button'} variant="outline" onClick={() => setBlocks([])} disabled={isLoading}>
                                <BrushCleaning className="mr-2 h-4 w-4"/>
                                Clear Layout
                            </Button>
                            <Button type={'button'} onClick={handleSaveLayout} disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4"/>
                                {isLoading ? 'Saving...' : 'Save Layout'}
                            </Button>
                        </div>
                    </div>

                    {/* Second row: Toolbox buttons when header placement is selected */}
                    {toolboxPlacement === 'header' && (
                        <div className="px-4 py-2 border-t flex items-center justify-end">
                            <div className="flex items-center space-x-2">
                                {toolButtons.map(tool => (
                                    <Button
                                        key={tool.type}
                                        type={'button'}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addNewBlock(tool.type)}
                                    >
                                        <Plus className="mr-2 h-4 w-4"/>
                                        {tool.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex h-full bg-muted/40" >
                    {toolboxPlacement === 'sidebar' && (
                        <aside className="w-64 border-r bg-background p-4 flex flex-col">
                            <div className="flex-grow space-y-4">
                                <h2 className="text-lg font-semibold">Toolbox</h2>
                                {toolButtons.map(tool => (
                                    <Button
                                        key={tool.type}
                                        type={'button'}
                                        className="w-full justify-start"
                                        variant="ghost"
                                        onClick={() => addNewBlock(tool.type)}
                                    >
                                        <Plus className="mr-2 h-4 w-4"/> {tool.label}
                                    </Button>
                                ))}
                            </div>
                        </aside>
                    )}

                    {/* Canvas Wrapper */}
                    <div className="flex-1 relative flex items-center justify-center p-8">
                        <div className="w-full h-full max-w-5xl max-h-[80vh] relative">
                            <div
                                className="w-full h-full bg-background border rounded-lg shadow-lg overflow-auto relative">
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
                                            return <ResizableDraggableBlock key={block.id} block={block}
                                                                            onSelect={setSelectedBlock}
                                                                            onResize={handleResize}/>
                                        }
                                        return <DraggableBlock key={block.id} block={block}
                                                               onSelect={setSelectedBlock}/>
                                    })}
                                </main>
                            </div>

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
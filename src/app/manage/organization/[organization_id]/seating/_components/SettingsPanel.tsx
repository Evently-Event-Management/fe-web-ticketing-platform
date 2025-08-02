import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription, SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {Button} from "@/components/ui/button";
import {Trash2} from "lucide-react";
import {LayoutBlock} from "@/types/seating-layouts";


export function SettingsPanel({
                           selectedBlock,
                           onUpdate,
                           onDelete,
                           onClose,
                       }: {
    selectedBlock: LayoutBlock | null;
    onUpdate: (updatedBlock: LayoutBlock) => void;
    onDelete: (blockId: string) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<Partial<LayoutBlock>>({});

    React.useEffect(() => {
        setFormData(selectedBlock || {});
    }, [selectedBlock]);

    if (!selectedBlock) return null;

    const handleChange = (field: keyof LayoutBlock, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(formData as LayoutBlock);
        onClose();
    };

    return (
        <Sheet open={!!selectedBlock} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Block: {selectedBlock.name}</SheetTitle>
                    <SheetDescription>
                        Modify the properties of this block.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Block Name</Label>
                        <Input id="name" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                    {selectedBlock.type === 'seated_grid' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="rows">Rows</Label>
                                <Input id="rows" type="number" value={formData.rows || ''} onChange={e => handleChange('rows', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="columns">Columns</Label>
                                <Input id="columns" type="number" value={formData.columns || ''} onChange={e => handleChange('columns', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startRowLabel">Start Row Label</Label>
                                <Input id="startRowLabel" value={formData.startRowLabel || ''} onChange={e => handleChange('startRowLabel', e.target.value.toUpperCase())} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startColumnLabel">Start Column Number</Label>
                                <Input id="startColumnLabel" type="number" value={formData.startColumnLabel || ''} onChange={e => handleChange('startColumnLabel', parseInt(e.target.value))} />
                            </div>
                        </>
                    )}
                    {selectedBlock.type === 'standing_capacity' && (
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input id="capacity" type="number" value={formData.capacity || ''} onChange={e => handleChange('capacity', parseInt(e.target.value))} />
                        </div>
                    )}
                </div>
                <SheetFooter className="flex flex-row justify-between items-center">
                    <Button variant="destructive" onClick={() => onDelete(selectedBlock.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}


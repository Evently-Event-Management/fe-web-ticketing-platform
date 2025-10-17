'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData, TierFormData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Ticket, Edit, Trash2, PlusCircle} from 'lucide-react';
import {TierDialog} from './TierDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function TiersStep() {
    const {control, formState: {errors}} = useFormContext<CreateEventFormData>();
    const initialRenderRef = useRef(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "tiers",
        keyName: "key"
    });

    console.log('TiersStep render, current tiers:', fields);

    const newId = () =>
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // Add default "General Admission" tier only on initial render
    useEffect(() => {
        if (initialRenderRef.current && fields.length === 0) {
            append({
                id: newId(),
                name: 'General Admission',
                price: 0,
                color: '#3B82F6' // Blue color
            });
        }
        initialRenderRef.current = false;
    }, [append, fields.length]);

    const handleCreateTier = (tier: TierFormData) => {
        // Force a fresh unique ID on create regardless of dialog payload
        append({
            ...tier,
            id: newId(),
        });
    };

    const handleEditTier = (tier: TierFormData) => {
        if (editingIndex !== null) {
            // Preserve existing ID on edit to avoid duplicates
            update(editingIndex, {
                ...tier,
                id: fields[editingIndex].id,
            });
            setEditingIndex(null);
        }
    };

    const openEditDialog = (index: number) => {
        setEditingIndex(index);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (index: number) => {
        setDeletingIndex(index);
        setDeleteDialogOpen(true);
    };

    const handleDeleteTier = () => {
        if (deletingIndex !== null) {
            remove(deletingIndex);
            setDeletingIndex(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Tiers & Pricing</h2>
                    <p className="text-sm text-muted-foreground">
                        Create different ticket types for your event. You will assign these to seats in a later step.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                    className="shrink-0 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add New Tier
                </Button>
            </div>

            <div className="space-y-6">
                {fields.length === 0 ? (
                    <div className="py-8 text-center border rounded-lg">
                        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
                        <p className="text-lg text-muted-foreground">
                            No tiers added yet. Click &#34;Add Tier&#34; to create your first ticket tier.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="rounded-lg border overflow-hidden flex flex-col">
                                <div
                                    className="h-2"
                                    style={{backgroundColor: field.color || '#6b7280'}}
                                />
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold line-clamp-1">{field.name}</h3>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                type={'button'}
                                                onClick={() => openEditDialog(index)}
                                            >
                                                <Edit className="h-4 w-4"/>
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type={'button'}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                onClick={() => openDeleteDialog(index)}
                                                disabled={fields.length <= 1} // Prevent deleting the last tier
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-4">
                                        {field.color && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{backgroundColor: field.color}}
                                                />
                                                <span className="font-mono text-xs">{field.color}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-2xl font-bold"> LKR {field.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* This will display the root error for the tiers array */}
                {errors.tiers?.root && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-medium text-destructive">
                            {errors.tiers.root.message}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Tier Dialog */}
            <TierDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                onSave={handleCreateTier}
                mode="create"
            />

            {/* Edit Tier Dialog */}
            {editingIndex !== null && (
                <TierDialog
                    open={editDialogOpen}
                    setOpen={setEditDialogOpen}
                    onSave={handleEditTier}
                    initialValues={{
                        id: fields[editingIndex].id,
                        name: fields[editingIndex].name,
                        price: fields[editingIndex].price,
                        color: fields[editingIndex].color || '#8B5CF6'
                    }}
                    mode="edit"
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this ticket tier.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTier}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
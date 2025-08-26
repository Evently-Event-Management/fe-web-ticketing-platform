'use client';

import * as React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';

const tierSchema = z.object({
    name: z.string().min(1, {message: "Tier name is required"}),
    price: z.number().min(0, {message: "Price must be a positive number"}),
    color: z.string().min(1, {message: "Color is required"})
});

type TierFormValues = z.infer<typeof tierSchema>;

interface TierDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onSave: (tier: { name: string, price: number, color: string }) => void;
    initialValues?: { name: string, price: number, color: string };
    mode: 'create' | 'edit';
}

export function TierDialog({open, setOpen, onSave, initialValues, mode}: TierDialogProps) {
    // Default values when creating a new tier
    const defaultValues: TierFormValues = {
        name: '',
        price: 0,
        color: '#8B5CF6' // Default purple color
    };

    const form = useForm<TierFormValues>({
        resolver: zodResolver(tierSchema),
        defaultValues: initialValues || defaultValues
    });

    const handleSubmit = (values: TierFormValues) => {
        onSave({
            name: values.name,
            price: values.price,
            color: values.color
        });
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Tier' : 'Edit Tier'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Tier Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., VIP, Premium, Gold"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Price (LKR)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="5000.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Theme Color</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="color"
                                                className="p-1 h-10 w-16 cursor-pointer bg-background"
                                                {...field}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="#8B5CF6"
                                                className="flex-1 font-mono text-sm"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit(handleSubmit)(e);
                                }}
                                type="button"
                            >
                                {mode === 'create' ? 'Create' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import * as React from 'react';
import {useEffect, useRef} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {PlusCircle, Ticket} from 'lucide-react';
import {TicketCard} from "@/app/manage/organization/[organization_id]/event/_components/TicketCard";

export function TiersStep() {
    const {control, formState: {errors}} = useFormContext<CreateEventFormData>();
    const initialRenderRef = useRef(true);

    const {fields, append, remove} = useFieldArray({
        control,
        name: "tiers",
    });

    // Add default "General Admission" tier only on initial render
    useEffect(() => {
        if (initialRenderRef.current && fields.length === 0) {
            append({
                id: `default_tier_${Date.now()}`,
                name: 'General Admission',
                price: 0,
                color: '#3B82F6' // Blue color
            });
        }
        initialRenderRef.current = false;
    }, [append, fields.length]);

    const addNewTier = () => {
        append({
            id: `temp_tier_${Date.now()}`, // Temporary client ID
            name: '',
            price: 0,
            color: '#8B5CF6' // Purple default color
        });
    };

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Tiers & Pricing</CardTitle>
                <CardDescription className="text-base">
                    Create different ticket types for your event. You will assign these to seats in a later step.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.length === 0 && (
                    <div className="py-8 text-center">
                        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">
                            No tiers added yet. Click &#34;Add Tier&#34; to create your first ticket tier.
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <TicketCard
                            key={field.id}
                            name={field.name || ''}
                            price={field.price || 0}
                            color={field.color || '#8B5CF6'}
                            index={index}
                            control={control}
                            onRemove={() => remove(index)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={control}
                                    name={`tiers.${index}.name`}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Tier Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., VIP, Premium, Gold"
                                                    className="border-2 focus:border-primary/50 bg-background/80"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`tiers.${index}.price`}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Price (USD)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="50.00"
                                                    className="border-2 focus:border-primary/50 bg-background/80"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`tiers.${index}.color`}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Theme Color
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        className="p-1 h-10 w-16 border-2 rounded-lg cursor-pointer bg-background"
                                                        {...field}
                                                    />
                                                    <Input
                                                        type="text"
                                                        placeholder="#3B82F6"
                                                        className="flex-1 border-2 focus:border-primary/50 bg-background/80 font-mono text-sm"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </TicketCard>
                    ))}
                </div>

                <div className="pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addNewTier}
                        className="w-full md:w-auto border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Tier
                    </Button>
                </div>

                {/* This will display the root error for the tiers array (e.g., "You must create at least one tier.") */}
                {errors.tiers?.root && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-medium text-destructive">
                            {errors.tiers.root.message}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
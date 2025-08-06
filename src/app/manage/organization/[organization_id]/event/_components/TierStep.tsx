'use client';

import * as React from 'react';
import {useEffect, useRef} from 'react';
import {useFormContext, useFieldArray} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {PlusCircle, Trash2} from 'lucide-react';

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
            color: '#FFFFFF' // Default color
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tiers & Pricing</CardTitle>
                <CardDescription>
                    Create different ticket types for your event. You will assign these to seats in a later step.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.length === 0 && (
                    <div className="py-4 text-center text-muted-foreground">
                        No tiers added yet. Click &#34;Add Tier&#34; to create your first ticket tier.
                    </div>
                )}

                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                        <FormField
                            control={control}
                            name={`tiers.${index}.name`}
                            render={({field}) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Tier Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., VIP" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`tiers.${index}.price`}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="50.00"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`tiers.${index}.color`}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input type="color" className="p-1 h-10" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}

                <Button type="button" variant="outline" onClick={addNewTier}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Tier
                </Button>

                {/* This will display the root error for the tiers array (e.g., "You must create at least one tier.") */}
                {errors.tiers?.root && (
                    <p className="text-sm font-medium text-destructive">{errors.tiers.root.message}</p>
                )}
            </CardContent>
        </Card>
    );
}

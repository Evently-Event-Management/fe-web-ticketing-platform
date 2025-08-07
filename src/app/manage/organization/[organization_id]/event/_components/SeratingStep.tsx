'use client';

import * as React from 'react';
import {useState} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {SeatingConfigDialog} from './SeatingConfigDialog';
import {
    SessionListItemSeating
} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItemSeating"; // We will create this next


// --- Main Seating Step Component ---
export function SeatingStep() {
    const { control, formState: { errors } } = useFormContext<CreateEventFormData>();
    const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);

    const { fields } = useFieldArray({
        control,
        name: "sessions",
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seating & Tier Assignment</CardTitle>
                <CardDescription>
                    Configure the seating layout and assign ticket tiers for each session.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <SessionListItemSeating
                        key={field.id}
                        field={field}
                        index={index}
                        onConfigure={() => setConfiguringIndex(index)}
                    />
                ))}

                {errors.sessions?.root && (
                    <p className="text-sm font-medium text-destructive">{errors.sessions.root.message}</p>
                )}

                {configuringIndex !== null && (
                    <SeatingConfigDialog
                        sessionIndex={configuringIndex}
                        open={configuringIndex !== null}
                        setOpen={() => setConfiguringIndex(null)}
                    />
                )}
            </CardContent>
        </Card>
    );
}

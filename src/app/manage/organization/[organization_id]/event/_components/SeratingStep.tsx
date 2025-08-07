'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {
    SessionListItemSeating
} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItemSeating";
import {OnlineConfigView} from "@/app/manage/organization/[organization_id]/event/_components/OnlineConfigView";
import {PhysicalConfigView} from "@/app/manage/organization/[organization_id]/event/_components/PhysicalConfigView";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {ArrowLeft} from "lucide-react";

interface SeatingStepProps {
    onConfigModeChange?: (isInConfigMode: boolean) => void;
}

// --- Main Seating Step Component ---
export function SeatingStep({ onConfigModeChange }: SeatingStepProps) {
    const { control, formState: { errors }, watch, getValues, setValue } = useFormContext<CreateEventFormData>();
    const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
    const [applyToAll, setApplyToAll] = useState(false);

    const { fields } = useFieldArray({
        control,
        name: "sessions",
    });

    // Get the session being configured
    const currentSession = configuringIndex !== null ? watch(`sessions.${configuringIndex}`) : null;

    // Notify parent component when configuration mode changes
    useEffect(() => {
        if (onConfigModeChange) {
            onConfigModeChange(configuringIndex !== null);
        }
    }, [configuringIndex, onConfigModeChange]);

    const handleSave = (layoutData: any) => {
        if (configuringIndex === null) return;

        setValue(`sessions.${configuringIndex}.layoutData`, layoutData);

        if (applyToAll) {
            const allSessions = getValues('sessions');
            allSessions.forEach((s, i) => {
                // Apply only to sessions of the same type (online/physical)
                if (s.isOnline === currentSession?.isOnline) {
                    setValue(`sessions.${i}.layoutData`, layoutData);
                }
            });
            toast.success(`Seating applied to all ${currentSession?.isOnline ? 'online' : 'physical'} sessions.`);
        } else {
            toast.success(`Seating configured for Session ${configuringIndex + 1}.`);
        }

        setConfiguringIndex(null);
    };

    // If we're configuring a session, show the full-page configuration view
    if (configuringIndex !== null && currentSession) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => setConfiguringIndex(null)}
                        className="flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sessions
                    </Button>
                    <h2 className="text-xl font-semibold">
                        Configure Seating for Session {configuringIndex + 1}
                    </h2>
                    <div></div> {/* Empty div for flexbox spacing */}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentSession.isOnline
                                ? "Online Capacity Configuration"
                                : "Physical Seating Configuration"}
                        </CardTitle>
                        <CardDescription>
                            {currentSession.isOnline
                                ? "Set the capacity and ticket tier for your online event."
                                : "Choose a layout template or create a new one, then assign your tiers."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentSession.isOnline ? (
                            <OnlineConfigView onSave={handleSave} />
                        ) : (
                            <PhysicalConfigView onSave={handleSave} />
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between border-t pt-4 mt-8">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="apply-to-all-seating"
                            checked={applyToAll}
                            onCheckedChange={(checked) => setApplyToAll(checked === true)}
                        />
                        <Label htmlFor="apply-to-all-seating">
                            Apply to all {currentSession.isOnline ? 'online' : 'physical'} sessions
                        </Label>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise show the session list
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
            </CardContent>
        </Card>
    );
}

'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionSeatingMapRequest} from '@/lib/validators/event';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {
    SessionListItemSeating
} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItemSeating";
import {OnlineConfigView} from "@/app/manage/organization/[organization_id]/event/_components/OnlineConfigView";
import {PhysicalConfigView} from "@/app/manage/organization/[organization_id]/event/_components/PhysicalConfigView";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {ArrowLeft} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {SessionType} from "@/types/enums/sessionType";

interface SeatingStepProps {
    onConfigModeChange?: (isInConfigMode: boolean) => void;
}

// --- Main Seating Step Component ---
export function SeatingStep({onConfigModeChange}: SeatingStepProps) {
    const {control, formState: {errors}, watch, getValues, setValue} = useFormContext<CreateEventFormData>();
    const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
    const [configuredLayoutData, setConfiguredLayoutData] = useState<SessionSeatingMapRequest | null>(null);
    const [showApplyDialog, setShowApplyDialog] = useState(false);

    const {fields} = useFieldArray({
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

    const handleSaveConfiguration = (layoutData: SessionSeatingMapRequest) => {
        setConfiguredLayoutData(layoutData);
        setShowApplyDialog(true);
    };

    const applyToCurrentSessionOnly = () => {
        if (configuringIndex === null || !configuredLayoutData) return;

        setValue(`sessions.${configuringIndex}.layoutData`, configuredLayoutData);
        toast.success(`Seating configured for Session ${configuringIndex + 1}.`);

        // Reset and close
        setConfiguredLayoutData(null);
        setShowApplyDialog(false);
        setConfiguringIndex(null);
    };

    const applyToAllSessions = () => {
        if (configuringIndex === null || !configuredLayoutData) return;

        const allSessions = getValues('sessions');
        allSessions.forEach((s, i) => {
            // Apply only to sessions of the same type (online/physical)
            if (s.sessionType === currentSession?.sessionType) {
                setValue(`sessions.${i}.layoutData`, configuredLayoutData);
            }
        });

        toast.success(`Seating applied to all ${currentSession?.sessionType === SessionType.ONLINE ? 'online' : 'physical'} sessions.`);

        // Reset and close
        setConfiguredLayoutData(null);
        setShowApplyDialog(false);
        setConfiguringIndex(null);
    };

    // If we're configuring a session, show the full-page configuration view
    if (configuringIndex !== null && currentSession) {
        return (
            <div className="space-y-4">
                <div className="">
                    <Button
                        variant="ghost"
                        onClick={() => setConfiguringIndex(null)}
                        className="flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to Sessions
                    </Button>
                    <h2 className="text-xl font-semibold">
                        Configure Seating for Session {configuringIndex + 1}
                    </h2>
                    <div></div>
                    {/* Empty div for flexbox spacing */}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentSession.sessionType === SessionType.ONLINE
                                ? "Online Capacity Configuration"
                                : "Physical Seating Configuration"}
                        </CardTitle>
                        <CardDescription>
                            {currentSession.sessionType === SessionType.ONLINE
                                ? "Set the capacity and ticket tier for your online event."
                                : "Choose a layout template or create a new one, then assign your tiers."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentSession.sessionType === SessionType.ONLINE ? (
                            <OnlineConfigView onSave={handleSaveConfiguration}/>
                        ) : (
                            <PhysicalConfigView
                                onSave={handleSaveConfiguration}
                                initialConfig={currentSession.layoutData as SessionSeatingMapRequest}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Apply to all dialog */}
                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apply Seating Configuration</DialogTitle>
                        </DialogHeader>
                        <p className="py-4">
                            Would you like to apply this seating configuration to all
                            {currentSession.sessionType === SessionType.ONLINE ? ' online' : ' physical'} sessions
                            or just this one?
                        </p>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={applyToCurrentSessionOnly}>
                                This session only
                            </Button>
                            <Button onClick={applyToAllSessions}>
                                Apply to all {currentSession.sessionType === SessionType.ONLINE ? 'online' : 'physical'} sessions
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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

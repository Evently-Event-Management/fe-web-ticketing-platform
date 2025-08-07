'use client';

import * as React from 'react';
import {useState} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionFormData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {PlusCircle, Repeat, Trash2,} from 'lucide-react';
import {toast} from 'sonner';
import {SessionConfigDialog} from "@/app/manage/organization/[organization_id]/event/_components/SessionConfigDialog";
import {
    RecurringSessionsDialog
} from "@/app/manage/organization/[organization_id]/event/_components/RecurringSessionsDialog";
import {SingleSessionDialog} from "@/app/manage/organization/[organization_id]/event/_components/SingleSessionDialog";
import {SessionListItem} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItem";
import {useLimits} from "@/providers/LimitProvider";

// --- Main Scheduling Step Component ---
export function SchedulingStep() {
    const {control, formState: {errors}} = useFormContext<CreateEventFormData>();
    const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
    const [isSingleSessionDialogOpen, setIsSingleSessionDialogOpen] = useState(false);
    const {myLimits} = useLimits();

    const maxSessions = myLimits?.tierLimits.maxSessionsPerEvent || 10; // Default to 10 if not set

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "sessions",
    });

    const handleGenerateSessions = (newSessions: SessionFormData[]) => {
        // Session count validation is now handled in the dialog component
        append(newSessions);
        toast.success(`${newSessions.length} recurring sessions have been added.`);
    };

    const handleAddSingleSession = (newSession: SessionFormData) => {
        // Session count validation is now handled in the dialog component
        append(newSession);
        toast.success("New session has been added.");
    };

    const clearAllSessions = () => {
        replace([]); // replace with an empty array
        toast.info("All sessions have been cleared.");
    };

    // Disable add buttons if we've reached the maximum
    const hasReachedLimit = fields.length >= maxSessions;

    const openSingleSessionDialog = () => {
        if (hasReachedLimit) {
            toast.error(`Cannot add more sessions. You have reached the limit of ${maxSessions} sessions.`);
            return;
        }
        setIsSingleSessionDialogOpen(true);
    };

    const openRecurringSessionsDialog = () => {
        if (hasReachedLimit) {
            toast.error(`Cannot add more sessions. You have reached the limit of ${maxSessions} sessions.`);
            return;
        }
        setIsRecurringDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scheduling & Location</CardTitle>
                <CardDescription>
                    Add the dates and times for your event. Each session can have a unique location.
                    {maxSessions > 0 && (
                        <span className="block mt-1">
                            Session limit: {fields.length}/{maxSessions}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <SessionListItem key={field.id} field={field} index={index} onRemoveAction={remove}/>
                ))}

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openSingleSessionDialog}
                        disabled={hasReachedLimit}
                    >
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Single Session
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openRecurringSessionsDialog}
                        disabled={hasReachedLimit}
                    >
                        <Repeat className="mr-2 h-4 w-4"/>
                        Add Recurring Sessions
                    </Button>
                    {fields.length > 0 && (
                        <Button type="button" variant="destructive" className="ml-auto" onClick={clearAllSessions}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Clear All
                        </Button>
                    )}
                </div>

                {errors.sessions?.root && (
                    <p className="text-sm font-medium text-destructive">{errors.sessions.root.message}</p>
                )}

                {configuringIndex !== null && (
                    <SessionConfigDialog
                        index={configuringIndex}
                        open={true}
                        setOpen={() => setConfiguringIndex(null)}
                    />
                )}

                <RecurringSessionsDialog
                    open={isRecurringDialogOpen}
                    setOpen={setIsRecurringDialogOpen}
                    onGenerate={handleGenerateSessions}
                    currentSessionCount={fields.length}
                    maxSessions={maxSessions}
                />

                <SingleSessionDialog
                    open={isSingleSessionDialogOpen}
                    setOpen={setIsSingleSessionDialogOpen}
                    onAdd={handleAddSingleSession}
                    currentSessionCount={fields.length}
                    maxSessions={maxSessions}
                />
            </CardContent>
        </Card>
    );
}

'use client';

import * as React from 'react';
import {useState} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionBasicData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {PlusCircle, Repeat, Trash2, Calendar} from 'lucide-react';
import {toast} from 'sonner';
import {
    RecurringSessionsDialog
} from "@/app/manage/organization/[organization_id]/event/_components/RecurringSessionsDialog";
import {SingleSessionDialog} from "@/app/manage/organization/[organization_id]/event/_components/SingleSessionDialog";
import {SessionListItem} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItem";
import {useLimits} from "@/providers/LimitProvider";
import {CreateSessionsFormData} from "@/app/manage/organization/[organization_id]/event/[eventId]/sessions/create/page";

// --- Main Scheduling Step Component ---
export function SchedulingStep() {
    const {control, formState: {errors}} = useFormContext<CreateEventFormData | CreateSessionsFormData>();
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
    const [isSingleSessionDialogOpen, setIsSingleSessionDialogOpen] = useState(false);
    const {myLimits} = useLimits();

    const maxSessions = myLimits?.tierLimits.maxSessionsPerEvent || 10; // Default to 10 if not set

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "sessions",
    });

    const handleGenerateSessions = (newSessions: SessionBasicData[]) => {
        append(newSessions as typeof fields);
        toast.success(`${newSessions.length} recurring sessions have been added.`);
    };

    const handleAddSingleSession = (newSession: SessionBasicData) => {
        append(newSession as typeof fields[0]);
        toast.success("New session has been added.");
    };

    const clearAllSessions = () => {
        replace([]);
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
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Scheduling & Location</h2>
                    <p className="text-sm text-muted-foreground">
                        Add the dates and times for your event. Each session can have a unique location.
                    </p>
                </div>
                <div className="flex w-full justify-between">
                    {maxSessions > 0 && (
                        <span className="block mt-1">
                                Session limit: {fields.length}/{maxSessions}
                            </span>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={openSingleSessionDialog}
                            disabled={hasReachedLimit}
                            className="shrink-0 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        >
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Single Session
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={openRecurringSessionsDialog}
                            disabled={hasReachedLimit}
                            className="shrink-0 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        >
                            <Repeat className="mr-2 h-4 w-4"/>
                            Add Recurring Sessions
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <SessionListItem key={field.id} index={index} onRemoveAction={remove}/>
                ))}

                {fields.length === 0 && (
                    <div className="py-8 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>
                        <p className="text-lg text-muted-foreground">
                            No sessions added yet. Use the buttons above to add sessions to your event.
                        </p>
                    </div>
                )}

                {errors.sessions?.root && (
                    <p className="text-sm font-medium text-destructive">{errors.sessions.root.message}</p>
                )}
                {fields.length > 0 && (
                    <div className={'flex flex-wrap gap-2 w-full justify-end'}>
                        <Button type="button" variant="outline" onClick={clearAllSessions} className="shrink-0">
                            <Trash2 className="mr-2 h-4 w-4 text-destructive"/>
                            Clear All
                        </Button>
                    </div>

                )}
            </div>

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
        </div>
    );
}

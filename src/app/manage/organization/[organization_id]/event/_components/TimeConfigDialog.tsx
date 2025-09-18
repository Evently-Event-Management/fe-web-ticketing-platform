'use client';

import { useFormContext} from "react-hook-form";
import {baseSessionSchema, CreateEventFormData} from "@/lib/validators/event";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {FormControl, FormItem, FormLabel} from "@/components/ui/form";
import {DateTimePicker} from "@/app/manage/organization/[organization_id]/event/_components/DateTimePicker";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {useEffect, useState} from "react";
import {Duration, intervalToDuration} from "date-fns";
import {toast} from "sonner";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";

// Helper function remains the same
const formatDuration = (duration: Duration): string => {
    const parts = [];
    if (duration.days) parts.push(`${duration.days}d`);
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
};

export function TimeConfigDialog({index, open, setOpenAction}: {
    index: number;
    open: boolean;
    setOpenAction: (open: boolean) => void
}) {
    const {getValues, setValue, clearErrors} = useFormContext<CreateEventFormData>();
    const sessionPath = `sessions.${index}` as const;

    // --- 1. Local State for a "Snapshot" ---
    // These will hold the temporary edits within the dialog.
    const [localStartTime, setLocalStartTime] = useState<string | undefined>();
    const [localEndTime, setLocalEndTime] = useState<string | undefined>();
    const [localSalesStartTime, setLocalSalesStartTime] = useState<string | undefined>();

    // --- 2. Initializing on Open (Creating the Snapshot) ---
    useEffect(() => {
        if (open) {
            // When the dialog opens, copy the values from the main form into our local state.
            const sessionData = getValues(sessionPath);
            setLocalStartTime(sessionData.startTime);
            setLocalEndTime(sessionData.endTime);
            setLocalSalesStartTime(sessionData.salesStartTime);
            // Clear any old errors when opening
            clearErrors([`${sessionPath}.startTime`, `${sessionPath}.endTime`, `${sessionPath}.salesStartTime`]);
        }
    }, [open, getValues, sessionPath, clearErrors]);

    // --- Real-time Calculations from Local State ---
    let sessionDuration = "N/A", salesWindow = "N/A";
    let isDurationInvalid = false, isSalesWindowInvalid = false;

    try {
        const startDate = new Date(localStartTime!);
        const endDate = new Date(localEndTime!);
        const salesDate = new Date(localSalesStartTime!);

        if (!localStartTime || !localEndTime || endDate <= startDate) {
            isDurationInvalid = true;
            sessionDuration = "Invalid Range";
        } else {
            sessionDuration = formatDuration(intervalToDuration({start: startDate, end: endDate}));
        }

        if (!localStartTime || !localSalesStartTime || startDate <= salesDate) {
            isSalesWindowInvalid = true;
            salesWindow = "Must be before start";
        } else {
            salesWindow = `${formatDuration(intervalToDuration({start: salesDate, end: startDate}))} before start`;
        }
    } catch (e) {
        // Handle cases where date strings are not yet valid
        isDurationInvalid = true;
        isSalesWindowInvalid = true;
    }


    // --- 3. Transactional handleSave ---
    const handleSave = async () => {
        // First, create a temporary session object with the other data from the form
        // combined with our local, edited time values.
        const originalSessionData = getValues(sessionPath);
        const sessionDataToValidate = {
            ...originalSessionData,
            startTime: localStartTime,
            endTime: localEndTime,
            salesStartTime: localSalesStartTime,
        };

        const validationResult = await baseSessionSchema.safeParseAsync(sessionDataToValidate);

        if (validationResult.success) {
            // On success, COMMIT the changes to the main form state
            setValue(`${sessionPath}.startTime`, localStartTime!, {shouldValidate: true, shouldDirty: true});
            setValue(`${sessionPath}.endTime`, localEndTime!, {shouldValidate: true, shouldDirty: true});
            setValue(`${sessionPath}.salesStartTime`, localSalesStartTime!, {shouldValidate: true, shouldDirty: true});

            toast.success(`Time for session ${index + 1} updated.`);
            setOpenAction(false);
        } else {
            // On failure, show toasts, but DON'T set errors on the main form,
            const {formErrors, fieldErrors} = validationResult.error.flatten();
            const messages = [...formErrors, ...Object.values(fieldErrors).flat()];
            new Set(messages).forEach(msg => toast.error(msg));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpenAction}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure Time for Session {index + 1}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                            <DateTimePicker value={localStartTime ?? ""} onChange={setLocalStartTime}/>
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                            <DateTimePicker value={localEndTime ?? ""} onChange={setLocalEndTime}/>
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Ticket Sales Start Time</FormLabel>
                        <FormControl>
                            <DateTimePicker value={localSalesStartTime ?? ""} onChange={setLocalSalesStartTime}/>
                        </FormControl>
                    </FormItem>

                    <Separator/>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Session Duration</p>
                            <p className={cn("font-medium", isDurationInvalid && "text-destructive")}>
                                {sessionDuration}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Sales Window</p>
                            <p className={cn("font-medium", isSalesWindowInvalid && "text-destructive")}>
                                {salesWindow}
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    {/* --- 5. Effortless Cancel --- */}
                    <Button type="button" variant="outline" onClick={() => setOpenAction(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSave}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

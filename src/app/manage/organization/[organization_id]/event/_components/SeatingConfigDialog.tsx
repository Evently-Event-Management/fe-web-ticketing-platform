'use client';

import * as React from 'react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionSeatingMapRequest} from '@/lib/validators/event';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import {OnlineConfigView} from "@/app/manage/organization/[organization_id]/event/_components/OnlineConfigView";
import {PhysicalConfigView} from "@/app/manage/organization/[organization_id]/event/_components/PhysicalConfigView";


// --- Main Dialog Component ---
export function SeatingConfigDialog({sessionIndex, open, setOpen}: {
    sessionIndex: number;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const {watch, getValues, setValue} = useFormContext<CreateEventFormData>();
    const session = watch(`sessions.${sessionIndex}`);
    const [applyToAll, setApplyToAll] = useState(false);

    const handleSave = (layoutData: SessionSeatingMapRequest) => {
        setValue(`sessions.${sessionIndex}.layoutData`, layoutData);

        if (applyToAll) {
            const allSessions = getValues('sessions');
            allSessions.forEach((s, i) => {
                // Apply only to sessions of the same type (online/physical)
                if (s.isOnline === session.isOnline) {
                    setValue(`sessions.${i}.layoutData`, layoutData);
                }
            });
            toast.success(`Seating applied to all ${session.isOnline ? 'online' : 'physical'} sessions.`);
        } else {
            toast.success(`Seating configured for Session ${sessionIndex + 1}.`);
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Configure Seating for Session {sessionIndex + 1}</DialogTitle>
                    <DialogDescription>
                        {session.isOnline
                            ? "Set the capacity and ticket tier for your online event."
                            : "Choose a layout template or create a new one, then assign your tiers."}
                    </DialogDescription>
                </DialogHeader>
                {session.isOnline ? (
                    <OnlineConfigView sessionIndex={sessionIndex} onSave={handleSave}/>
                ) : (
                    <PhysicalConfigView sessionIndex={sessionIndex} onSave={handleSave}/>
                )}
                <DialogFooter className="justify-between sm:justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="apply-to-all-seating" checked={applyToAll}
                                  onCheckedChange={(checked) => setApplyToAll(checked === true)}/>
                        <Label htmlFor="apply-to-all-seating">Apply to
                            all {session.isOnline ? 'online' : 'physical'} sessions</Label>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

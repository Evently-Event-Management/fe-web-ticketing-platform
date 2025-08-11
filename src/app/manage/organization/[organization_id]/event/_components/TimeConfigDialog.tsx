import {useFormContext} from "react-hook-form";
import {CreateEventFormData} from "@/lib/validators/event";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {DateTimePicker} from "@/app/manage/organization/[organization_id]/event/_components/DateTimePicker";
import {Button} from "@/components/ui/button";
import * as React from "react";

export function TimeConfigDialog({index, open, setOpen}: {
    index: number;
    open: boolean;
    setOpen: (open: boolean) => void
}) {
    const {control} = useFormContext<CreateEventFormData>();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure Time for Session {index + 1}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField control={control} name={`sessions.${index}.startTime`} render={({field}) => (
                        <FormItem><FormLabel>Start Time</FormLabel><FormControl><DateTimePicker value={field.value}
                                                                                                onChange={field.onChange}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={control} name={`sessions.${index}.endTime`} render={({field}) => (
                        <FormItem><FormLabel>End Time</FormLabel><FormControl><DateTimePicker value={field.value}
                                                                                              onChange={field.onChange}/></FormControl><FormMessage/></FormItem>)}/>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={() => setOpen(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
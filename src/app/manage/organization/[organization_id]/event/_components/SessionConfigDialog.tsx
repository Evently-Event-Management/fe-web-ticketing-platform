// --- Session Configuration Dialog ---
import {useFormContext} from "react-hook-form";
import {CreateEventFormData} from "@/lib/validators/event";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {DateTimePicker} from "@/app/manage/organization/[organization_id]/event/_components/DateTimePicker";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Copy} from "lucide-react";
import * as React from "react";

export function SessionConfigDialog({index, open, setOpen}: {
    index: number,
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const {control, watch, getValues, setValue} = useFormContext<CreateEventFormData>();
    const isOnline = watch(`sessions.${index}.isOnline`);

    const handleCopyToAll = () => {
        const currentSessionData = getValues(`sessions.${index}`);
        const allSessions = getValues('sessions');
        allSessions.forEach((_, i) => {
            if (i !== index) {
                setValue(`sessions.${i}.isOnline`, currentSessionData.isOnline);
                setValue(`sessions.${i}.onlineLink`, currentSessionData.onlineLink);
                setValue(`sessions.${i}.venueDetails`, currentSessionData.venueDetails);
                // You can add sales rules here too
            }
        });
        toast.success("Location details copied to all other sessions.");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure Session {index + 1}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Start & End Time Fields */}
                    <FormField
                        control={control}
                        name={`sessions.${index}.startTime`}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <DateTimePicker value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`sessions.${index}.endTime`}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <DateTimePicker value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <hr/>
                    {/* Location Fields */}
                    <FormField control={control} name={`sessions.${index}.isOnline`} render={({field}) => (
                        <FormItem
                            className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel>Online
                            Session</FormLabel><FormControl><Switch checked={field.value}
                                                                    onCheckedChange={field.onChange}/></FormControl></FormItem>
                    )}/>
                    {isOnline ? (
                        <FormField control={control} name={`sessions.${index}.onlineLink`} render={({field}) => (
                            <FormItem><FormLabel>Online Link</FormLabel><FormControl><Input
                                placeholder="https://zoom.us/..." {...field} /></FormControl><FormMessage/></FormItem>)}/>
                    ) : (
                        <div className="space-y-2">
                            <FormField control={control} name={`sessions.${index}.venueDetails.name`}
                                       render={({field}) => (
                                           <FormItem><FormLabel>Venue Name</FormLabel><FormControl><Input
                                               placeholder="e.g., Grand Hall" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            {/* Add other venue fields and Google Maps component here */}
                        </div>
                    )}
                </div>
                <DialogFooter className="justify-between">
                    <Button type="button" variant="ghost" onClick={handleCopyToAll}><Copy className="mr-2 h-4 w-4"/>Copy
                        to All</Button>
                    <Button type="button" onClick={() => setOpen(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
import {useFormContext} from "react-hook-form";
import {CreateEventFormData} from "@/lib/validators/event";
import * as React from "react";
import {useState} from "react";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";

export function LocationConfigDialog({index, open, setOpen}: {
    index: number;
    open: boolean;
    setOpen: (open: boolean) => void
}) {
    const {control, watch, getValues, setValue} = useFormContext<CreateEventFormData>();
    const isOnline = watch(`sessions.${index}.isOnline`);
    const [applyToAll, setApplyToAll] = useState(false);

    const handleSave = () => {
        if (applyToAll) {
            const currentSessionData = getValues(`sessions.${index}`);
            const allSessions = getValues('sessions');
            allSessions.forEach((_, i) => {
                setValue(`sessions.${i}.isOnline`, currentSessionData.isOnline);
                setValue(`sessions.${i}.onlineLink`, currentSessionData.onlineLink);
                setValue(`sessions.${i}.venueDetails`, currentSessionData.venueDetails);
            });
            toast.success("Location details applied to all sessions.");
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Configure Location for Session {index + 1}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue={isOnline ? "online" : "physical"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="physical"
                                     onClick={() => setValue(`sessions.${index}.isOnline`, false)}>Physical</TabsTrigger>
                        <TabsTrigger value="online"
                                     onClick={() => setValue(`sessions.${index}.isOnline`, true)}>Online</TabsTrigger>
                    </TabsList>
                    <TabsContent value="physical" className="pt-4">
                        <div className="space-y-4">
                            <FormField control={control} name={`sessions.${index}.venueDetails.name`}
                                       render={({field}) => (
                                           <FormItem><FormLabel>Venue Name</FormLabel><FormControl><Input
                                               placeholder="e.g., Grand Hall" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            {/* Add Address and Google Maps component here */}
                        </div>
                    </TabsContent>
                    <TabsContent value="online" className="pt-4">
                        <FormField control={control} name={`sessions.${index}.onlineLink`} render={({field}) => (
                            <FormItem><FormLabel>Online Link</FormLabel><FormControl><Input
                                placeholder="https://zoom.us/..." {...field} /></FormControl><FormMessage/></FormItem>)}/>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="justify-between sm:justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="apply-to-all" checked={applyToAll}
                                  onCheckedChange={checked => setApplyToAll(checked === true)}/> <Label
                        htmlFor="apply-to-all">Apply to all sessions</Label>
                    </div>
                    <Button type="button" onClick={handleSave}>Save Location</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
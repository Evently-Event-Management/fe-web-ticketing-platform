'use client';

import * as React from 'react';
import {useState} from 'react';
import {useFormContext, useFieldArray, useForm, Controller} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PlusCircle, Trash2, Calendar as CalendarIcon, Clock, Copy, Repeat} from 'lucide-react';
import {format, setHours, setMinutes, parseISO, addDays, addWeeks} from 'date-fns';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {cn} from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {Switch} from '@/components/ui/switch';
import {toast} from 'sonner';


// --- Reusable DateTimePicker Component ---
interface DateTimePickerProps {
    value: string; // ISO string
    onChange: (isoString: string) => void;
}

function DateTimePicker({value, onChange}: DateTimePickerProps) {
    const [date, setDate] = useState<Date | undefined>(value ? parseISO(value) : new Date());
    const [time, setTime] = useState(value ? format(parseISO(value), 'HH:mm') : '10:00');

    const handleDateChange = (selectedDate?: Date) => {
        if (!selectedDate) return;
        const [hours, minutes] = time.split(':').map(Number);
        let newDate = setHours(selectedDate, hours);
        newDate = setMinutes(newDate, minutes);
        setDate(newDate);
        onChange(newDate.toISOString());
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
        const [hours, minutes] = e.target.value.split(':').map(Number);
        if (date && !isNaN(hours) && !isNaN(minutes)) {
            let newDate = setHours(date, hours);
            newDate = setMinutes(newDate, minutes);
            setDate(newDate);
            onChange(newDate.toISOString());
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
            <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-[120px]"
            />
        </div>
    );
}


// --- Session Configuration Dialog ---
function SessionConfigDialog({index, open, setOpen}: {
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

function RecurringSessionsDialog({open, setOpen, onGenerate}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    onGenerate: (sessions: any[]) => void
}) {
    const {control, handleSubmit} = useForm({
        defaultValues: {
            frequency: 'weekly',
            interval: 1,
            count: 8,
            startDate: new Date(),
            startTime: '19:00',
            durationHours: 2,
        }
    });

    const onSubmit = (data: any) => {
        const newSessions = [];
        let currentStartTime = setMinutes(setHours(data.startDate, parseInt(data.startTime.split(':')[0])), parseInt(data.startTime.split(':')[1]));

        for (let i = 0; i < data.count; i++) {
            const endTime = new Date(currentStartTime.getTime() + data.durationHours * 60 * 60 * 1000);
            newSessions.push({
                startTime: currentStartTime.toISOString(),
                endTime: endTime.toISOString(),
                isOnline: false, // Default values
                salesStartRuleType: 'ROLLING',
                salesStartHoursBefore: 24 * 7,
                layoutData: {name: 'Default', layout: {blocks: []}},
            });

            if (data.frequency === 'daily') {
                currentStartTime = addDays(currentStartTime, data.interval);
            } else if (data.frequency === 'weekly') {
                currentStartTime = addWeeks(currentStartTime, data.interval);
            }
        }
        onGenerate(newSessions);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Recurring Sessions</DialogTitle>
                    <DialogDescription>Generate a series of sessions based on a recurring pattern.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="frequency" control={control} render={({field}) => (
                            <FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange}
                                                                              defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem
                                value="daily">Daily</SelectItem><SelectItem
                                value="weekly">Weekly</SelectItem></SelectContent></Select></FormItem>
                        )}/>
                        <Controller name="interval" control={control} render={({field}) => (
                            <FormItem><FormLabel>Repeat Every</FormLabel><FormControl><Input type="number"
                                                                                             min="1" {...field}
                                                                                             onChange={e => field.onChange(parseInt(e.target.value))}/></FormControl></FormItem>
                        )}/>
                    </div>
                    <Controller name="count" control={control} render={({field}) => (
                        <FormItem><FormLabel>Number of Sessions</FormLabel><FormControl><Input type="number" min="1"
                                                                                               max="52" {...field}
                                                                                               onChange={e => field.onChange(parseInt(e.target.value))}/></FormControl></FormItem>
                    )}/>
                    <Controller name="startDate" control={control} render={({field}) => (
                        <FormItem><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><Button
                            variant="outline" className="w-full justify-start font-normal"><CalendarIcon
                            className="mr-2 h-4 w-4"/>{field.value ? format(field.value, 'PPP') :
                            <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent
                            className="w-auto p-0"><Calendar mode="single" selected={field.value}
                                                             onSelect={field.onChange}
                                                             initialFocus/></PopoverContent></Popover></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="startTime" control={control} render={({field}) => (
                            <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input
                                type="time" {...field}/></FormControl></FormItem>
                        )}/>
                        <Controller name="durationHours" control={control} render={({field}) => (
                            <FormItem><FormLabel>Duration (hours)</FormLabel><FormControl><Input type="number" min="0.5"
                                                                                                 step="0.5" {...field}
                                                                                                 onChange={e => field.onChange(parseFloat(e.target.value))}/></FormControl></FormItem>
                        )}/>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Generate Sessions</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// --- Main Scheduling Step Component ---
export function SchedulingStep() {
    const {control, formState: {errors}} = useFormContext<CreateEventFormData>();
    const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "sessions",
    });

    const handleGenerateSessions = (newSessions: any[]) => {
        append(newSessions);
        toast.success(`${newSessions.length} recurring sessions have been added.`);
    };

    const clearAllSessions = () => {
        replace([]); // replace with an empty array
        toast.info("All sessions have been cleared.");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scheduling & Location</CardTitle>
                <CardDescription>
                    Add the dates and times for your event. Each session can have a unique location.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                            <p className="font-medium">Session {index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(parseISO(field.startTime), "PPP p")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => setConfiguringIndex(index)}>
                                Configure
                            </Button>
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => append({
                        startTime: new Date().toISOString(),
                        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
                        isOnline: false,
                        salesStartRuleType: 'ROLLING',
                        salesStartHoursBefore: 168,
                        layoutData: {name: 'Default', layout: {blocks: []}}
                    })}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Single Session
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsRecurringDialogOpen(true)}>
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
                />
            </CardContent>
        </Card>
    );
}


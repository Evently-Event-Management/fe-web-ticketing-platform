import {Controller, useForm} from "react-hook-form";
import {addDays, addWeeks, format, setHours, setMinutes, subDays, subHours} from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {FormControl, FormItem, FormLabel} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Calendar as CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import * as React from "react";
import {SessionBasicData} from "@/lib/validators/event";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";
import {SalesStartRuleType} from "@/types/enums/salesStartRuleType";
import {SessionType} from "@/types/enums/sessionType";
import {z} from "zod";

interface RecurringSessionFormValues {
    frequency: 'daily' | 'weekly';
    interval: number;
    count: number;
    startDate: Date;
    startTime: string;
    durationHours: number;
    salesStartRuleType: SalesStartRuleType;
    salesStartHoursBefore: number;
    salesStartFixedDatetime: Date;
    salesStartFixedTime: string;
    isDaysNotHours: boolean;
}

export const recurringSessionDialogSchema = z.object({
    frequency: z.enum(['daily', 'weekly']),
    interval: z.number().min(1, "Interval must be at least 1"),
    count: z.number().min(1, "Count must be at least 1").max(52, "Cannot create more than 52 sessions"),
    startDate: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    durationHours: z.number().min(0.5, "Duration must be at least 0.5 hours"),
    salesStartRuleType: z.enum([SalesStartRuleType.IMMEDIATE, SalesStartRuleType.ROLLING, SalesStartRuleType.FIXED]),
    salesStartHoursBefore: z.number().min(1, "Must be at least 1 hour before"),
    salesStartFixedDatetime: z.date(),
    salesStartFixedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
})
    .transform((data) => {
        const sessions: SessionBasicData[] = [];
        let currentStartTime = setMinutes(
            setHours(new Date(data.startDate), parseInt(data.startTime.split(':')[0])),
            parseInt(data.startTime.split(':')[1])
        );

        // For fixed sales start, calculate the datetime once
        let fixedSalesStartTime: Date | undefined;
        if (data.salesStartRuleType === SalesStartRuleType.FIXED) {
            const [hours, minutes] = data.salesStartFixedTime.split(':').map(num => parseInt(num));
            fixedSalesStartTime = setMinutes(
                setHours(new Date(data.salesStartFixedDatetime), hours),
                minutes
            );
        }

        for (let i = 0; i < data.count; i++) {
            const endTime = new Date(currentStartTime.getTime() + data.durationHours * 60 * 60 * 1000);
            let salesStartTimeObj = subDays(currentStartTime, 7);

            if (data.salesStartRuleType === SalesStartRuleType.IMMEDIATE) {
                salesStartTimeObj = new Date();
            } else if (data.salesStartRuleType === SalesStartRuleType.ROLLING) {
                salesStartTimeObj = subHours(currentStartTime, data.salesStartHoursBefore);
            } else if (data.salesStartRuleType === SalesStartRuleType.FIXED && fixedSalesStartTime) {
                salesStartTimeObj = fixedSalesStartTime;
            }

            sessions.push({
                startTime: currentStartTime.toISOString(),
                sessionType: null,
                endTime: endTime.toISOString(),
                salesStartTime: salesStartTimeObj.toISOString(),
            });

            if (data.frequency === 'daily') {
                currentStartTime = addDays(currentStartTime, data.interval);
            } else if (data.frequency === 'weekly') {
                currentStartTime = addWeeks(currentStartTime, data.interval);
            }
        }

        return sessions;
    })
    .refine((sessions) => {
        return sessions.every(session => {
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            const salesStart = new Date(session.salesStartTime);
            return end > start && salesStart < start && start > new Date();
        });
    }, {
        message: "All sessions must have valid start, end, and sales start times",
    })
    .refine((sessions) => {
        if (sessions.length > 0) {
            const firstSessionStart = new Date(sessions[0].startTime);
            const salesStart = new Date(sessions[0].salesStartTime);
            return salesStart < firstSessionStart;
        }
        return true;
    }, {
        message: "Sales start time must be before the first event start time",
    });

export function RecurringSessionsDialog({open, setOpen, onGenerate, currentSessionCount, maxSessions}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    onGenerate: (sessions: SessionBasicData[]) => void,
    currentSessionCount: number,
    maxSessions: number
}) {
    const {control, handleSubmit, watch, setValue, reset} = useForm<RecurringSessionFormValues>({
        defaultValues: {
            frequency: 'weekly',
            interval: 1,
            count: 5,
            startDate: new Date(),
            startTime: '19:00',
            durationHours: 2,
            salesStartRuleType: SalesStartRuleType.ROLLING,
            salesStartHoursBefore: 168,
            salesStartFixedDatetime: new Date(),
            salesStartFixedTime: '12:00',
            isDaysNotHours: true,
        }
    });

    const salesStartHoursBefore = watch('salesStartHoursBefore');
    const isDaysNotHours = watch('isDaysNotHours');

    // Handle toggling between days and hours
    const handleUnitToggle = (checked: boolean) => {
        setValue('isDaysNotHours', checked);
        if (checked) {
            // Converting hours to days (rounded)
            setValue('salesStartHoursBefore', Math.round(salesStartHoursBefore / 24) * 24);
        } else {
            // Converting days to hours
            setValue('salesStartHoursBefore', Math.round(salesStartHoursBefore / 24));
        }
    };

    const onSubmit = (data: RecurringSessionFormValues) => {
        // Check if adding these sessions would exceed the limit
        if (currentSessionCount + data.count > maxSessions) {
            toast.error(`Cannot add ${data.count} sessions. You are limited to ${maxSessions} total sessions (${currentSessionCount} already added).`);
            return;
        }

        // Use Zod to validate and transform the raw form data
        const parsedResult = recurringSessionDialogSchema.safeParse(data);

        if (!parsedResult.success) {
            console.error("Recurring session form validation failed:", parsedResult.error);
            parsedResult.error.issues.forEach((issue) => toast.error(issue.message));
            return;
        }

        // Transform the sessions to include layoutData
        const newSessions: SessionBasicData[] = parsedResult.data.map(session => ({
            ...session,
            layoutData: {name: null, layout: {blocks: []}},
        }));

        console.log("Generated sessions:", newSessions);
        onGenerate(newSessions);
        reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Recurring Sessions</DialogTitle>
                    <DialogDescription>
                        Generate a series of sessions based on a recurring pattern.
                        {maxSessions > 0 && (
                            <span className="block mt-1 text-sm text-muted-foreground">
                                Limit: {currentSessionCount}/{maxSessions} sessions used.
                            </span>
                        )}
                    </DialogDescription>
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
                                                             autoFocus/></PopoverContent></Popover></FormItem>
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

                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="salesStartRuleType" control={control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Sales Start Rule</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                        <SelectItem value="ROLLING">Rolling (Before Event)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Datetime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}/>


                        {watch('salesStartRuleType') === 'ROLLING' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Unit</FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">Hours</span>
                                        <Controller
                                            name="isDaysNotHours"
                                            control={control}
                                            render={({field}) => (
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={handleUnitToggle}
                                                />
                                            )}
                                        />
                                        <span className="text-sm text-muted-foreground">Days</span>
                                    </div>
                                </div>

                                <Controller
                                    name="salesStartHoursBefore"
                                    control={control}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>
                                                {isDaysNotHours ? 'Days before event' : 'Hours before event'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    value={isDaysNotHours ? Math.round(field.value / 24) : field.value}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        if (isDaysNotHours) {
                                                            // If days, store as hours in the form data
                                                            field.onChange(value * 24);
                                                        } else {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {watch('salesStartRuleType') === 'FIXED' && (
                            <>
                                <Controller name="salesStartFixedDatetime" control={control} render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Sales Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                                    {field.value ? format(field.value, 'PPP') :
                                                        <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}/>
                                <Controller name="salesStartFixedTime" control={control} render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Sales Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit">Generate Sessions</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

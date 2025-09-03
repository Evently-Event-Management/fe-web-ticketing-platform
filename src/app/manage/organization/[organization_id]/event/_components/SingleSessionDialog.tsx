import {Controller, useForm} from "react-hook-form";
import {format, setHours, setMinutes, subDays, subHours} from "date-fns";
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
import {SessionFormData} from "@/lib/validators/event";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";
import {Enums, SessionType} from "@/lib/validators/enums";

interface SingleSessionFormValues {
    startDate: Date;
    startTime: string;
    durationHours: number;
    salesStartRuleType: Enums;
    salesStartHoursBefore: number;
    salesStartFixedDatetime: Date;
    salesStartFixedTime: string; // Added field for fixed time
    isDaysNotHours: boolean;
}

export function SingleSessionDialog({open, setOpen, onAdd, currentSessionCount, maxSessions}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    onAdd: (session: SessionFormData) => void,
    currentSessionCount: number,
    maxSessions: number
}) {
    const {control, handleSubmit, watch, setValue} = useForm<SingleSessionFormValues>({
        defaultValues: {
            startDate: new Date(),
            startTime: '19:00',
            durationHours: 2,
            salesStartRuleType: Enums.ROLLING,
            salesStartHoursBefore: 168,
            salesStartFixedDatetime: new Date(),
            salesStartFixedTime: '12:00', // Default fixed time
            isDaysNotHours: true, // Field to track if user is entering days or hours
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

    const onSubmit = (data: SingleSessionFormValues) => {
        if (currentSessionCount >= maxSessions) {
            toast.error(`Cannot add more sessions. You have reached the limit of ${maxSessions} sessions.`);
            return;
        }

        const startTime = setMinutes(
            setHours(
                new Date(data.startDate),
                parseInt(data.startTime.split(':')[0])
            ),
            parseInt(data.startTime.split(':')[1])
        );

        const endTime = new Date(startTime.getTime() + data.durationHours * 60 * 60 * 1000);

        let salesStartTime = new Date(subDays(startTime, 7)).toISOString();

        if (data.salesStartRuleType === Enums.IMMEDIATE) {
            salesStartTime = new Date().toISOString();
        } else if (data.salesStartRuleType === Enums.ROLLING) {
            salesStartTime = subHours(startTime, data.salesStartHoursBefore).toISOString();
        } else if (data.salesStartRuleType === Enums.FIXED) {

            if (!data.salesStartFixedDatetime) {
                toast.error("Please select a sales start date for the fixed rule.");
                return;
            }

            const [hours, minutes] = data.salesStartFixedTime.split(':').map(num => parseInt(num));
            const fixedSalesStartTime = setMinutes(
                setHours(
                    new Date(data.salesStartFixedDatetime),
                    hours
                ),
                minutes
            );

            if (fixedSalesStartTime >= startTime) {
                toast.error("Sales start time must be before the event start time");
                return;
            }

            salesStartTime = fixedSalesStartTime.toISOString();
        }

        const newSession: SessionFormData = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            sessionType: SessionType.PHYSICAL,
            salesStartTime: salesStartTime,
            layoutData: {name: null, layout: {blocks: []}}
        };

        onAdd(newSession);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Single Session</DialogTitle>
                    <DialogDescription>
                        Configure the details for this session.
                        {maxSessions > 0 && (
                            <span className="block mt-1 text-sm text-muted-foreground">
                                Limit: {currentSessionCount}/{maxSessions} sessions used.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller name="startDate" control={control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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

                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="startTime" control={control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}/>
                        <Controller name="durationHours" control={control} render={({field}) => (
                            <FormItem>
                                <FormLabel>Duration (hours)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                            </FormItem>
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
                        <Button type="button" onClick={handleSubmit(onSubmit)}>Add Session</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Reusable DateTimePicker Component ---
import * as React from "react";
import {useState} from "react";
import {format, parseISO, setHours, setMinutes} from "date-fns";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Calendar as CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";

interface DateTimePickerProps {
    value: string; // ISO string
    onChange: (isoString: string) => void;
}

export function DateTimePicker({value, onChange}: DateTimePickerProps) {
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
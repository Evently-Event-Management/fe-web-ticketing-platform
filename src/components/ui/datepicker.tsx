"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  onChange: (date: string | null) => void
  label?: string
  placeholder?: string
}

export function DatePicker({
  onChange,
  label = "Pick a date",
  placeholder = "Select date"
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date>()

  // Format date to ISO string (ISO.DATE_TIME) for the API
  React.useEffect(() => {
    if (date) {
      // Convert to ISO string which is in the format required by the backend
      onChange(date.toISOString());
    } else {
      onChange(null);
    }
  }, [date, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

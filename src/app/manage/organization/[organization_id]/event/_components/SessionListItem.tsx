import {useFormContext} from "react-hook-form";
import {CreateEventFormData, SessionFormData} from "@/lib/validators/event";
import * as React from "react";
import {useState} from "react";
import {LinkIcon, MapPin, Settings, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {format, parseISO} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {TimeConfigDialog} from "@/app/manage/organization/[organization_id]/event/_components/TimeConfigDialog";
import {LocationConfigDialog} from "@/app/manage/organization/[organization_id]/event/_components/LocationConfigDialog";

export function SessionListItem({field, index, onRemove}: {
    field: SessionFormData;
    index: number;
    onRemove: (index: number) => void
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

    const isOnline = watch(`sessions.${index}.isOnline`);
    const venueName = watch(`sessions.${index}.venueDetails.name`);
    const onlineLink = watch(`sessions.${index}.onlineLink`);

    const hasLocation = isOnline ? !!onlineLink : !!venueName;

    const LocationIcon = hasLocation ? (isOnline ? LinkIcon : MapPin) : Settings;
    const locationIconColor = hasLocation ? "text-primary" : "text-destructive";

    return (
        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className={locationIconColor}
                        onClick={() => setIsLocationDialogOpen(true)}>
                    <LocationIcon className="h-5 w-5"/>
                </Button>
                <div>
                    <p className="font-medium">Session {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(parseISO(field.startTime), "PPP p")}
                    </p>
                </div>
                {hasLocation ? (
                    <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? 'Online' : 'Physical'}</Badge>
                ) : (
                    <Badge variant="destructive">Location Not Set</Badge>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTimeDialogOpen(true)}>
                    Edit Time
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>

            <TimeConfigDialog index={index} open={isTimeDialogOpen} setOpen={setIsTimeDialogOpen}/>
            <LocationConfigDialog index={index} open={isLocationDialogOpen} setOpenAction={setIsLocationDialogOpen}/>
        </div>
    );
}
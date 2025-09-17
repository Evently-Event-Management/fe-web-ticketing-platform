import * as React from 'react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionWithVenueData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {format, parseISO} from 'date-fns';
import {Badge} from '@/components/ui/badge';
import {TimeConfigDialog} from './TimeConfigDialog'; // Assuming this component exists
import {LinkIcon, MapPin, Settings, Trash2, Edit, Tag} from 'lucide-react';
import dynamic from "next/dynamic";
import {SessionType} from "@/types/enums/sessionType";

const LocationConfigDialog = dynamic(
    () => import("./LocationConfigDialog").then(mod => mod.LocationConfigDialog),
    {ssr: false}
);

// Helper function to display the sales start time
const getSalesStartTimeDisplay = (session: SessionWithVenueData): string => {
    if (!session || !session.salesStartTime) return "Sales start time not set";

    try {
        const salesStartDate = parseISO(session.salesStartTime);
        return `Sales start on ${format(salesStartDate, 'MMM d, yyyy h:mm a')}`;
    } catch (e) {
        console.error("Error parsing sales start time:", e);
        return "Invalid sales start time";
    }
};

export function SessionListItem({field, index, onRemoveAction}: {
    field: SessionWithVenueData; // react-hook-form's field type
    index: number;
    onRemoveAction: (index: number) => void
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

    // Watch all relevant fields for this specific session
    const sessionData = watch(`sessions.${index}`);

    // Gracefully handle case where sessionData might be undefined during a remove operation
    if (!sessionData) {
        return null;
    }

    const {sessionType, venueDetails} = sessionData;

    const hasLocation = venueDetails !== undefined;
    const isOnline = sessionType === SessionType.ONLINE
    const onlineLink = sessionData.venueDetails?.onlineLink

    const LocationIcon = hasLocation ? (isOnline ? LinkIcon : MapPin) : Settings;
    const locationIconColor = hasLocation
        ? (isOnline
            ? "text-blue-500 dark:text-blue-400"
            : "text-green-500 dark:text-green-400")
        : "text-destructive";

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button type={'button'} variant="ghost" size="icon" className={locationIconColor}
                            onClick={() => setIsLocationDialogOpen(true)}>
                        <LocationIcon className="h-5 w-5"/>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Session {index + 1}</p>
                            {hasLocation ? (
                                <Badge
                                    variant={isOnline ? "secondary" : "secondary"}>{isOnline ? 'Online' : 'Physical'}</Badge>
                            ) : (
                                <Badge variant="destructive">Location Not Set</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {format(parseISO(field.startTime), "PPP p")} - {format(parseISO(field.endTime), "PPP p")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsTimeDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit Time
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveAction(index)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            <div className="border-t pt-3 mt-3 text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                    {isOnline ? <LinkIcon className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                    <span>
                        {hasLocation ? (isOnline ? 'Online Link: ' : 'Venue: ') : 'Location: '}
                        {hasLocation ? (isOnline ? onlineLink : venueDetails?.name ?? 'Not set') : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4"/>
                    <span>{getSalesStartTimeDisplay(sessionData)}</span>
                </div>
            </div>

            <TimeConfigDialog index={index} open={isTimeDialogOpen} setOpenAction={setIsTimeDialogOpen}/>
            <LocationConfigDialog index={index} open={isLocationDialogOpen} setOpenAction={setIsLocationDialogOpen}/>
        </div>
    );
}

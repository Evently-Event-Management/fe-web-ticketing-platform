import * as React from 'react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData, SessionWithVenueData} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {format, parseISO, intervalToDuration} from 'date-fns';
import {Badge} from '@/components/ui/badge';
import {TimeConfigDialog} from './TimeConfigDialog'; // Assuming this component exists
import {LinkIcon, MapPin, Settings, Trash2, Edit, Tag, Hourglass} from 'lucide-react';
import dynamic from "next/dynamic";
import {SessionType} from "@/types/enums/sessionType";

const LocationConfigDialog = dynamic(
    () => import("./LocationConfigDialog").then(mod => mod.LocationConfigDialog),
    {ssr: false}
);

// Helper function to display the sales start time
const getSalesStartTimeDisplay = (session: SessionWithVenueData): string => {
    if (!session?.salesStartTime) return "Sales start time not set";
    try {
        const salesStartDate = parseISO(session.salesStartTime);
        return `Sales start on ${format(salesStartDate, 'MMM d, yyyy h:mm a')}`;
    } catch (e) {
        console.error("Error parsing sales start time:", e);
        return "Invalid sales start time";
    }
};

// NEW: Helper function to calculate and display the sales window duration
const getSalesWindowDuration = (session: SessionWithVenueData): string => {
    if (!session?.salesStartTime || !session?.startTime) {
        return "Sales window not available";
    }
    try {
        const salesStart = parseISO(session.salesStartTime);
        const sessionStart = parseISO(session.startTime);

        if (salesStart > sessionStart) return "Sales start after session begins";

        const duration = intervalToDuration({start: salesStart, end: sessionStart});

        const parts = [
            duration.days && `${duration.days}d`,
            duration.hours && `${duration.hours}h`,
            duration.minutes && `${duration.minutes}m`
        ].filter(Boolean);

        if (parts.length === 0) return "Sales open just before the session";

        return `Sales open for ${parts.join(', ')} before session`;
    } catch (e) {
        console.error("Error calculating sales window duration:", e);
        return "Could not calculate duration";
    }
};


export function SessionListItem({ index, onRemoveAction}: {
    field: SessionWithVenueData;
    index: number;
    onRemoveAction: (index: number) => void
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const sessionData = watch(`sessions.${index}`);

    if (!sessionData) return null; // Graceful exit on remove

    const {sessionType, venueDetails, startTime, endTime} = sessionData;
    const hasLocation = venueDetails !== undefined;
    const isOnline = sessionType === SessionType.ONLINE;

    // The main content of the list item, rendered conditionally
    const content = hasLocation ? (
        // --- VIEW WHEN LOCATION IS SET ---
        <div className="space-y-3 pt-3 mt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isOnline ? <LinkIcon className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                <span>
                    {isOnline ? 'Online Link: ' : 'Venue: '}
                    <span className="text-foreground font-medium">
                        {isOnline ? venueDetails.onlineLink : venueDetails.name ?? 'Not set'}
                    </span>
                </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4"/>
                <span>{getSalesStartTimeDisplay(sessionData)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hourglass className="h-4 w-4"/>
                <span>{getSalesWindowDuration(sessionData)}</span>
            </div>
        </div>
    ) : (
        // --- VIEW WHEN LOCATION IS NOT SET (CALL TO ACTION) ---
        <div className="flex flex-col items-center justify-center gap-3 p-4 mt-4 border-t">
            <MapPin className="h-8 w-8 text-muted-foreground"/>
            <div className="text-center">
                <p className="font-semibold">Location Not Set</p>
                <p className="text-sm text-muted-foreground">Add a physical venue or an online link.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsLocationDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4"/>
                Add Location
            </Button>
        </div>
    );

    return (
        <div className="flex flex-col p-4 border rounded-lg bg-card">
            {/* --- TOP HEADER (Always Visible) --- */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {hasLocation && (
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isOnline ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                            {isOnline ? <LinkIcon className="h-5 w-5 text-blue-500 dark:text-blue-400"/> : <MapPin className="h-5 w-5 text-green-500 dark:text-green-400"/>}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Session {index + 1}</p>
                            {hasLocation && (
                                <Badge variant="secondary">{isOnline ? 'Online' : 'Physical'}</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {format(parseISO(startTime), "PPP p")} - {format(parseISO(endTime), "p")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsTimeDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit Time
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => onRemoveAction(index)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            {/* --- CONDITIONAL CONTENT (Configured or CTA) --- */}
            {content}

            {/* --- DIALOGS --- */}
            <TimeConfigDialog index={index} open={isTimeDialogOpen} setOpenAction={setIsTimeDialogOpen}/>
            <LocationConfigDialog index={index} open={isLocationDialogOpen} setOpenAction={setIsLocationDialogOpen}/>
        </div>
    );
}
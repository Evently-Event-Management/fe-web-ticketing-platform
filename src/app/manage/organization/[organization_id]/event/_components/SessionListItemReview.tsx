// --- Read-Only Session List Item for Review ---
import {SalesStartRuleType, SessionFormData} from "@/lib/validators/event";
import {format, parseISO} from "date-fns";
import {Armchair, Calendar, Clock, Info, Link as LinkIcon, MapPin, Tag, Users} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import * as React from "react";

export function SessionListItemReview({session, index}: { session: SessionFormData; index: number; }) {
    const {isOnline, onlineLink, venueDetails, layoutData} = session;
    const hasLocation = isOnline ? !!onlineLink : !!venueDetails?.name;

    const getSalesRuleDescription = (): string => {
        switch (session.salesStartRuleType) {
            case SalesStartRuleType.IMMEDIATE:
                return "On sale immediately";
            case SalesStartRuleType.FIXED:
                return session.salesStartFixedDatetime
                    ? `Sales start on ${format(parseISO(session.salesStartFixedDatetime), 'MMM d, yyyy h:mm a')}`
                    : "Fixed date not set";
            case SalesStartRuleType.ROLLING:
                if (session.salesStartHoursBefore === undefined || session.salesStartHoursBefore === null || session.salesStartHoursBefore < 0) {
                    return "Rolling hours not set or invalid";
                } else if (session.salesStartHoursBefore < 24) {
                    return `Sales start ${session.salesStartHoursBefore} hour(s) before the session`;
                } else {
                    const days = Math.floor(session.salesStartHoursBefore / 24);
                    const hours = session.salesStartHoursBefore % 24;
                    return `Sales start ${days} day(s)${hours > 0 ? ` and ${hours} hour(s)` : ''} before the session`;
                }
            default:
                return "Not set";
        }
    };

    const getLayoutMetadata = () => {
        if (!layoutData || layoutData.layout.blocks.length === 0) return null;

        if (isOnline) {
            // For online events, show total capacity from blocks
            const totalCapacity = layoutData.layout.blocks.reduce((sum, block) => {
                return sum + (block.capacity || 0);
            }, 0);
            return totalCapacity > 0 ? `Capacity: ${totalCapacity}` : "Capacity not specified";
        } else {
            // For physical events, show layout name and total seats
            const layoutName = layoutData.name;
            const totalSeats = layoutData.layout.blocks.reduce((sum, block) => {
                if (block.rows && block.rows.length > 0) {
                    return sum + block.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0);
                } else if (block.capacity) {
                    // For standing blocks, use capacity
                    return sum + block.capacity;
                } else if (block.seats) {
                    return sum + (block.seats?.length || 0)
                }
                return sum;
            }, 0);

            const blockCount = layoutData.layout.blocks.length;

            return (
                <>
                    {layoutName && <span>Layout: {layoutName}</span>}
                    {blockCount > 0 && <span> • {blockCount} block(s)</span>}
                    {totalSeats > 0 && <span> • Total capacity: {totalSeats}</span>}
                </>
            );
        }
    };

    // Calculate event duration in hours and minutes
    const getDuration = () => {
        try {
            const start = parseISO(session.startTime);
            const end = parseISO(session.endTime);
            const durationMs = end.getTime() - start.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            return hours > 0
                ? `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
                : `${minutes} minutes`;
        } catch (e) {
            console.error("Error calculating duration:", e);
            return "Duration unavailable";
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        {isOnline ? <Users className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                    </div>
                    <div>
                        <p className="font-medium">Session {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{format(parseISO(session.startTime), "PPP p")}</p>
                    </div>
                    <Badge variant={isOnline ? "secondary" : "default"}>{isOnline ? 'Online' : 'Physical'}</Badge>
                    {!hasLocation && <Badge variant="destructive">Location Not Set</Badge>}
                </div>
            </div>

            <div className="border-t pt-3 text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <span>Date: {format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4"/>
                    <span>Time: {format(parseISO(session.startTime), "h:mm a")} - {format(parseISO(session.endTime), "h:mm a")} ({getDuration()})</span>
                </div>

                <div className="flex items-center gap-2">
                    {isOnline ? <LinkIcon className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                    <span>
                        {isOnline ? 'Online Link: ' : 'Venue: '}
                        {hasLocation
                            ? (isOnline
                                    ? onlineLink
                                    : (<>
                                        {venueDetails?.name}
                                        {venueDetails?.address &&
                                            <span className="opacity-75"> • {venueDetails.address}</span>}
                                    </>)
                            )
                            : <span className="text-destructive">Not set</span>
                        }
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4"/>
                    <span>Sales: {getSalesRuleDescription()}</span>
                </div>

                {layoutData && layoutData.layout.blocks.length > 0 && (
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5"/>
                        <span>{getLayoutMetadata()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
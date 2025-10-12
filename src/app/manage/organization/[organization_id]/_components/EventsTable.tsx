"use client";

import React from "react";
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {EventSummaryDTO} from "@/lib/validators/event";
// Assuming CompactEventCard is the component you want to use.
// Renamed from "CompactUpcommingEventCard" for clarity.
import {CompactEventCard} from "./CompactEventCard"; 

interface EventsTableProps {
    events: EventSummaryDTO[];
    organizationId: string;
    isLoading?: boolean;
}

const EventSkeleton = () => (
    <div className="flex w-full items-center gap-4 rounded-lg border border-border/60 p-4">
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md"/>
        <div className="flex-1 space-y-3 self-start">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-4/6"/>
                <Skeleton className="h-5 w-16"/>
            </div>
            <Skeleton className="h-4 w-2/5"/>
            <div className="grid grid-cols-3 gap-x-4 pt-1">
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
            </div>
        </div>
        <Skeleton className="hidden h-9 w-24 md:block"/>
    </div>
);


export const EventsTable: React.FC<EventsTableProps> = ({events, organizationId, isLoading = false}) => {
    const showSkeleton = isLoading && events.length === 0;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Events</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/manage/organization/${organizationId}/event`}>
                        View all
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {showSkeleton ? (
                    <div className="space-y-4">
                        {Array.from({length: 3}).map((_, index) => (
                            <EventSkeleton key={`event-skeleton-${index}`}/>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        No approved events ready to showcase yet. Launch an event to see it featured here.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.slice(0, 3).map(event => (
                            <CompactEventCard
                                key={event.id}
                                event={event}
                                organizationId={organizationId}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
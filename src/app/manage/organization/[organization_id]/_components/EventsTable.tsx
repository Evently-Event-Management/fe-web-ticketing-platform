"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {EventSummaryDTO, EventStatus} from "@/lib/validators/event";
import {Skeleton} from "@/components/ui/skeleton";
import {format} from "date-fns";
import {Eye} from "lucide-react";

interface EventsTableProps {
    events: EventSummaryDTO[];
    organizationId: string;
    isLoading?: boolean;
}

const statusVariants: Record<EventStatus, "default" | "secondary" | "outline" | "destructive" | "success" | "warning"> = {
    [EventStatus.APPROVED]: "success",
    [EventStatus.PENDING]: "warning",
    [EventStatus.REJECTED]: "destructive",
    [EventStatus.COMPLETED]: "default",
};

const formatDate = (value: string) => {
    try {
        return format(new Date(value), "MMM d, yyyy");
    } catch {
        return "—";
    }
};

export const EventsTable: React.FC<EventsTableProps> = ({events, organizationId, isLoading = false}) => {
    const showSkeleton = isLoading && events.length === 0;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming events</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/manage/organization/${organizationId}/event`}>
                        View all
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sessions</TableHead>
                            <TableHead>Next session</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showSkeleton ? (
                            Array.from({length: 4}).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-14 w-20 rounded-md"/>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-48"/>
                                                <Skeleton className="h-3 w-32"/>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                                    <TableCell><Skeleton className="h-5 w-12"/></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="h-8 w-20 ml-auto"/>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                    No events yet. Launch your first event to see it here.
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.slice(0, 5).map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-14 w-20 overflow-hidden rounded-md bg-muted">
                                                {event.coverPhoto && (
                                                    <Image src={event.coverPhoto} alt={event.title} fill className="object-cover"/>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium leading-tight text-foreground">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariants[event.status]}>{event.status}</Badge>
                                    </TableCell>
                                    <TableCell>{event.sessionCount}</TableCell>
                                    <TableCell>{formatDate(event.earliestSessionDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/manage/organization/${organizationId}/event/${event.id}`}>
                                                <Eye className="mr-1.5 h-4 w-4"/>
                                                Manage
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

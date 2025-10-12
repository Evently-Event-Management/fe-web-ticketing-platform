"use client";

import React from "react";
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {OrganizationSessionDTO} from "@/lib/actions/statsActions";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {formatDateTimeShort} from "@/lib/utils";
import {Eye} from "lucide-react";

interface SessionsTableProps {
    sessions: OrganizationSessionDTO[];
    organizationId: string;
    isLoading?: boolean;
}

const sessionStatusVariant: Record<SessionStatus, "default" | "secondary" | "outline" | "destructive" | "success" | "warning"> = {
    [SessionStatus.PENDING]: "warning",
    [SessionStatus.SCHEDULED]: "secondary",
    [SessionStatus.ON_SALE]: "success",
    [SessionStatus.SOLD_OUT]: "default",
    [SessionStatus.CLOSED]: "outline",
    [SessionStatus.CANCELED]: "destructive",
};

export const SessionsTable: React.FC<SessionsTableProps> = ({sessions, organizationId, isLoading = false}) => {
    const showSkeleton = isLoading && sessions.length === 0;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Session spotlight</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/manage/organization/${organizationId}/event/sessions`}>
                        View all
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Session</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showSkeleton ? (
                            Array.from({length: 5}).map((_, index) => (
                                <TableRow key={`session-skeleton-${index}`}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-48"/>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-40"/></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28"/></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="h-8 w-20 ml-auto"/>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                    No sessions to show yet. Create sessions to track their performance here.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions.slice(0, 5).map(session => (
                                <TableRow key={session.sessionId}>
                                    <TableCell className="font-medium text-foreground">
                                        {session.sessionType}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.eventTitle}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatDateTimeShort(session.startTime)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sessionStatusVariant[session.sessionStatus]}>
                                            {session.sessionStatus.replace(/_/g, " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/manage/organization/${organizationId}/event/sessions/${session.sessionId}`}>
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
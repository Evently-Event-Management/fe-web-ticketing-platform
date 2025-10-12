"use client";

import React from "react";
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {OrganizationSessionDTO} from "@/lib/actions/statsActions";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {formatDateTimeShort} from "@/lib/utils";
import {ArrowUpRight} from "lucide-react";

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
                <CardTitle>On-sale sessions</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/manage/organization/${organizationId}/event/sessions`}>
                        View all
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {showSkeleton ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {Array.from({length: 4}).map((_, index) => (
                            <div
                                key={`session-skeleton-${index}`}
                                className="rounded-2xl border bg-muted/20 p-5"
                            >
                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <Skeleton className="h-6 w-20"/>
                                    <Skeleton className="h-6 w-16"/>
                                </div>
                                <Skeleton className="mb-2 h-5 w-48"/>
                                <Skeleton className="mb-6 h-4 w-32"/>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-28"/>
                                    <Skeleton className="h-9 w-24"/>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed">
                        <p className="px-6 text-center text-sm text-muted-foreground">
                            No on-sale sessions yet. Once your sessions go live, they&apos;ll appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {sessions.slice(0, 4).map(session => (
                            <div
                                key={session.sessionId}
                                className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-5 shadow-sm transition hover:border-primary/60 hover:shadow-lg"
                            >
                                <div className="absolute inset-0 -z-10 opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true">
                                    <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]"/>
                                </div>
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <Badge variant={sessionStatusVariant[session.sessionStatus]} className="uppercase tracking-wide">
                                        {session.sessionStatus.replace(/_/g, " ")}
                                    </Badge>
                                    {session.categoryName && (
                                        <Badge variant="outline" className="bg-background/60">
                                            {session.categoryName}
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                                        {session.eventTitle}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {session.sessionType}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Starts</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatDateTimeShort(session.startTime)}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground/80">
                                            Ends {formatDateTimeShort(session.endTime)}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="secondary" className="group/button" asChild>
                                        <Link href={`/manage/organization/${organizationId}/event/sessions/${session.sessionId}`}>
                                            Manage
                                            <ArrowUpRight className="ml-1.5 h-4 w-4 transition group-hover/button:translate-x-0.5"/>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
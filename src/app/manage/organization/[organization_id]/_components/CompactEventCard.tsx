"use client";

import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Card} from "@/components/ui/card";
import {format} from "date-fns";
import {Eye, Calendar} from "lucide-react";
import {EventSummaryDTO, EventStatus} from "@/lib/validators/event";
import {getEventAnalytics, getEventRevenueAnalytics} from "@/lib/actions/analyticsActions";
import type {EventAnalytics} from "@/types/eventAnalytics";
import type {EventOrderAnalytics} from "@/lib/actions/analyticsActions";

// --- All hooks, props, types, and helper functions are preserved from the original component ---

interface CompactEventCardProps {
    event: EventSummaryDTO;
    organizationId: string;
}

interface InsightState {
    analytics?: EventAnalytics;
    orderAnalytics?: EventOrderAnalytics;
    isLoading: boolean;
    error?: string;
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

const computeSellThrough = (analytics?: EventAnalytics, ticketsSold?: number): number | undefined => {
    if (!analytics) return undefined;
    if (analytics.overallSellOutPercentage !== undefined) return analytics.overallSellOutPercentage;
    if (!analytics.totalEventCapacity || analytics.totalEventCapacity === 0) return undefined;
    if (ticketsSold === undefined) return undefined;
    return Math.min(100, Math.max(0, (ticketsSold / analytics.totalEventCapacity) * 100));
};

// --- New Compact Horizontal Card Component ---

export const CompactEventCard: React.FC<CompactEventCardProps> = ({event, organizationId}) => {
    const [state, setState] = useState<InsightState>({isLoading: true});

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setState(prev => ({...prev, isLoading: true, error: undefined}));
            try {
                const [analyticsResult, revenueResult] = await Promise.allSettled([
                    getEventAnalytics(event.id),
                    getEventRevenueAnalytics(event.id),
                ]);

                if (!isMounted) return;

                const nextState: InsightState = {isLoading: false};

                if (analyticsResult.status === "fulfilled") {
                    nextState.analytics = analyticsResult.value;
                } else {
                    console.error("Failed to load event analytics", analyticsResult.reason);
                }

                if (revenueResult.status === "fulfilled") {
                    nextState.orderAnalytics = revenueResult.value;
                } else {
                    console.error("Failed to load order analytics", revenueResult.reason);
                }

                if (!nextState.analytics && !nextState.orderAnalytics) {
                    nextState.error = "Analytics unavailable";
                }

                setState(nextState);
            } catch (err) {
                if (!isMounted) return;
                console.error("Unexpected error loading event insights", err);
                setState({isLoading: false, error: "Analytics unavailable"});
            }
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, [event.id]);

    const revenue = useMemo(() => {
        if (state.orderAnalytics?.total_revenue !== undefined) return state.orderAnalytics.total_revenue;
        if (state.analytics?.totalRevenue !== undefined) return state.analytics.totalRevenue;
        return undefined;
    }, [state.orderAnalytics?.total_revenue, state.analytics?.totalRevenue]);

    const ticketsSold = useMemo(() => {
        if (state.orderAnalytics?.total_tickets_sold !== undefined) return state.orderAnalytics.total_tickets_sold;
        if (state.analytics?.totalTicketsSold !== undefined) return state.analytics.totalTicketsSold;
        return undefined;
    }, [state.orderAnalytics?.total_tickets_sold, state.analytics?.totalTicketsSold]);

    const sellThrough = useMemo(
        () => computeSellThrough(state.analytics, ticketsSold),
        [state.analytics, ticketsSold]
    );

    const formattedRevenue = useMemo(() => {
        if (revenue === undefined) return undefined;
        return Math.round(revenue).toLocaleString("en-LK");
    }, [revenue]);

    return (
        <Card className="flex w-full flex-col overflow-hidden border border-border/60 bg-card shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-md sm:flex-row py-0">
            <div className="relative flex h-40 w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-40">
                {event.coverPhoto ? (
                    <Image
                        src={event.coverPhoto}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"/>
                )}
                <div className="absolute left-3 top-3 flex flex-col gap-2 text-white">
                    <Badge variant={statusVariants[event.status] ?? "secondary"}>
                        {event.status}
                    </Badge>
                    <span className="rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium">
                        {event.sessionCount} sessions
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1 min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground" title={event.title}>
                            {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3"/>
                                Next: {formatDate(event.earliestSessionDate)}
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="self-start">
                        <Link href={`/manage/organization/${organizationId}/event/${event.id}`}>
                            <Eye className="mr-1.5 h-4 w-4"/>
                            Manage
                        </Link>
                    </Button>
                </div>

                {state.error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        {state.error}
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Revenue (LKR)</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-2 h-4 w-20"/>
                            ) : formattedRevenue !== undefined ? (
                                <p className="mt-1 text-sm font-semibold text-foreground">{formattedRevenue}</p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Tickets Sold</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-2 h-4 w-16"/>
                            ) : ticketsSold !== undefined ? (
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {ticketsSold.toLocaleString("en-LK")}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Sell-through</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-2 h-4 w-12"/>
                            ) : sellThrough !== undefined ? (
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {Math.round(sellThrough)}%
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
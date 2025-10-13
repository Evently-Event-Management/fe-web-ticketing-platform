"use client";

import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Progress} from "@/components/ui/progress";
import {Card} from "@/components/ui/card";
import {format} from "date-fns";
import {Eye} from "lucide-react";
import {EventSummaryDTO, EventStatus} from "@/lib/validators/event";
import {getEventAnalytics, getEventRevenueAnalytics} from "@/lib/actions/analyticsActions";
import type {EventAnalytics} from "@/types/eventAnalytics";
import type {EventOrderAnalytics} from "@/lib/actions/analyticsActions";

interface EventCardProps {
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
    if (!analytics) {
        return undefined;
    }
    if (analytics.overallSellOutPercentage !== undefined) {
        return analytics.overallSellOutPercentage;
    }
    if (!analytics.totalEventCapacity || analytics.totalEventCapacity === 0) {
        return undefined;
    }
    if (ticketsSold === undefined) {
        return undefined;
    }
    return Math.min(100, Math.max(0, (ticketsSold / analytics.totalEventCapacity) * 100));
};

export const EventCard: React.FC<EventCardProps> = ({event, organizationId}) => {
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

                if (!isMounted) {
                    return;
                }

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
                if (!isMounted) {
                    return;
                }
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
        if (state.orderAnalytics?.total_revenue !== undefined) {
            return state.orderAnalytics.total_revenue;
        }
        if (state.analytics?.totalRevenue !== undefined) {
            return state.analytics.totalRevenue;
        }
        return undefined;
    }, [state.orderAnalytics?.total_revenue, state.analytics?.totalRevenue]);

    const ticketsSold = useMemo(() => {
        if (state.orderAnalytics?.total_tickets_sold !== undefined) {
            return state.orderAnalytics.total_tickets_sold;
        }
        if (state.analytics?.totalTicketsSold !== undefined) {
            return state.analytics.totalTicketsSold;
        }
        return undefined;
    }, [state.orderAnalytics?.total_tickets_sold, state.analytics?.totalTicketsSold]);

    const sellThrough = useMemo(
        () => computeSellThrough(state.analytics, ticketsSold),
        [state.analytics, ticketsSold]
    );

    const formattedRevenue = useMemo(() => {
        if (revenue === undefined) {
            return undefined;
        }
        return Math.round(revenue).toLocaleString("en-LK");
    }, [revenue]);

    return (
        <Card className="flex h-full flex-col overflow-hidden border border-border/60 bg-card shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-lg py-0 gap-0">
            <div className="relative h-48 w-full overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-white">
                        <Badge variant={statusVariants[event.status] ?? "secondary"}>
                            {event.status}
                        </Badge>
                        <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white/90">
                            {event.sessionCount} sessions
                        </span>
                    </div>
                    <div className="space-y-2 text-white">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold leading-tight text-white line-clamp-2">
                                {event.title}
                            </h3>
                            <p className="text-sm text-white/80 line-clamp-3">
                                {event.description}
                            </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/80">
                            <span>Next session</span>
                            <span className="font-medium text-white">{formatDate(event.earliestSessionDate)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 px-5 py-5">
                {state.error ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {state.error}
                    </p>
                ) : (
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">Revenue</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-3 h-5 w-24"/>
                            ) : formattedRevenue !== undefined ? (
                                <div className="mt-2 space-y-1">
                                    <p className="text-lg font-semibold leading-tight text-foreground">
                                        {formattedRevenue}
                                    </p>
                                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">LKR</span>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">Tickets</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-3 h-5 w-20"/>
                            ) : ticketsSold !== undefined ? (
                                <div className="mt-2 space-y-1">
                                    <p className="text-lg font-semibold leading-tight text-foreground">
                                        {ticketsSold.toLocaleString("en-LK")}
                                    </p>
                                    <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground">Sold</span>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">Sell-through</p>
                            {state.isLoading ? (
                                <Skeleton className="mt-3 h-5 w-16"/>
                            ) : sellThrough !== undefined ? (
                                <div className="mt-2 space-y-1">
                                    <p className="text-lg font-semibold leading-tight text-foreground">
                                        {Math.round(sellThrough)}%
                                    </p>
                                    <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground">of capacity</span>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">—</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3 rounded-lg border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Capacity</span>
                        {state.isLoading ? (
                            <Skeleton className="h-4 w-20"/>
                        ) : (
                            <span className="text-sm font-medium text-foreground">
                                {state.analytics?.totalEventCapacity !== undefined
                                    ? state.analytics.totalEventCapacity.toLocaleString("en-LK")
                                    : "—"}
                            </span>
                        )}
                    </div>
                    <div>
                        {state.isLoading ? (
                            <Skeleton className="h-2 w-full"/>
                        ) : sellThrough !== undefined ? (
                            <Progress value={sellThrough} className="h-2"/>
                        ) : (
                            <div className="h-2 rounded-full bg-muted"/>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {formatDate(event.updatedAt)}</span>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/manage/organization/${organizationId}/event/${event.id}`}>
                            <Eye className="mr-1.5 h-4 w-4"/>
                            Manage
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
};

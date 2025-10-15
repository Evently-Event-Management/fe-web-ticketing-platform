"use client";

import Link from "next/link";
import {RefreshCcw} from "lucide-react";
import {useAdminDashboardData} from "./_hooks/useAdminDashboardData";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {StatsCard} from "@/app/manage/organization/[organization_id]/_components/StatsCard";
import {AudienceViewsChart} from "@/app/manage/organization/[organization_id]/_components/AudienceViewsChart";
import {DeviceBreakdownChart} from "@/app/manage/organization/[organization_id]/_components/DeviceBreakdownChart";
import {TrafficSourcesChart} from "@/app/manage/organization/[organization_id]/_components/TrafficSourcesChart";
import {format} from "date-fns";
import {EventStatus} from "@/lib/validators/event";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

const statusVariant: Record<EventStatus, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    [EventStatus.APPROVED]: "success",
    [EventStatus.PENDING]: "warning",
    [EventStatus.REJECTED]: "destructive",
    [EventStatus.COMPLETED]: "secondary",
};

export default function AdminDashboardPage() {
    const {data, loading, error, refetch} = useAdminDashboardData();

    return (
        <div className="space-y-8 p-6 md:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">Admin Control Center</h1>
                <p className="text-muted-foreground">
                    Monitor platform-wide performance, review pending approvals, and keep a pulse on audience activity.
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>We hit a snag</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{error}</span>
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                            <RefreshCcw className="mr-2 h-4 w-4"/>
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Total views (30 days)"
                    value={data.overview.totalViews.toLocaleString("en-LK")}
                    subtitle="All events across the platform"
                    trendLabel="Unique visitors"
                    trendValue={data.overview.uniqueUsers.toLocaleString("en-LK")}
                    trendVariant="neutral"
                    isLoading={loading.overview}
                />
                <StatsCard
                    title="Total events"
                    value={data.totals.totalEvents.toLocaleString("en-LK")}
                    subtitle="Across all organizations"
                    trendLabel="Approved"
                    trendValue={data.totals.approvedEvents.toLocaleString("en-LK")}
                    trendVariant="positive"
                    isLoading={loading.totals}
                />
                <StatsCard
                    title="Pending approvals"
                    value={data.totals.pendingEvents.toLocaleString("en-LK")}
                    subtitle="Awaiting admin review"
                    trendLabel="Rejected"
                    trendValue={data.totals.rejectedEvents.toLocaleString("en-LK")}
                    trendVariant="warning"
                    isLoading={loading.totals}
                />
                <StatsCard
                    title="Approval queue health"
                    value={data.totals.totalEvents === 0
                        ? "0%"
                        : `${Math.round((data.totals.pendingEvents / Math.max(data.totals.totalEvents, 1)) * 100)}%`}
                    subtitle="Share of events pending approval"
                    trendLabel="Need attention"
                    trendValue={data.totals.pendingEvents > 0 ? "Yes" : "All clear"}
                    trendVariant={data.totals.pendingEvents > 0 ? "warning" : "positive"}
                    isLoading={loading.totals}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <AudienceViewsChart
                        data={data.overview.viewsTimeSeries}
                        totalViews={data.overview.totalViews}
                        isLoading={loading.overview}
                    />
                </div>
                <div className="xl:col-span-4">
                    <DeviceBreakdownChart
                        data={data.overview.deviceBreakdown}
                        totalViews={data.overview.totalViews}
                        isLoading={loading.overview}
                    />
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                    <TrafficSourcesChart
                        data={data.overview.trafficSources}
                        totalViews={data.overview.totalViews}
                        isLoading={loading.overview}
                    />
                </div>
                <div className="xl:col-span-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Top events by reach</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading.overview ? (
                                <div className="space-y-3">
                                    {Array.from({length: 4}).map((_, index) => (
                                        <Skeleton key={index} className="h-12 w-full"/>
                                    ))}
                                </div>
                            ) : data.topEvents.length === 0 ? (
                                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                                    No event traffic recorded yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-border/60">
                                    {data.topEvents.map((event, index) => (
                                        <li key={event.eventId} className="py-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
                                                        <Link
                                                            href={`/manage/admin/events/${event.eventId}`}
                                                            className="text-sm font-medium text-primary hover:underline"
                                                        >
                                                            {event.title ?? "Event unavailable"}
                                                        </Link>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {event.organizationName ?? (event.eventId ? `ID ${event.eventId.slice(0, 8)}` : "Unknown organization")}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {event.views.toLocaleString("en-LK")}
                                                    <span className="ml-1 text-xs text-muted-foreground">views</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section>
                <Card>
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Pending approvals</CardTitle>
                            <p className="text-sm text-muted-foreground">Newest events awaiting your decision.</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/manage/admin/events">Go to event queue</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading.pending ? (
                            <div className="space-y-3">
                                {Array.from({length: 4}).map((_, index) => (
                                    <Skeleton key={index} className="h-14 w-full"/>
                                ))}
                            </div>
                        ) : data.pendingApprovals.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                No events are waiting for approval right now.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/60">
                                {data.pendingApprovals.map(event => (
                                    <li key={event.id} className="py-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/manage/admin/events/${event.id}`}
                                                        className="text-sm font-semibold text-foreground hover:underline"
                                                    >
                                                        {event.title}
                                                    </Link>
                                                    <Badge variant={statusVariant[event.status as EventStatus] ?? "secondary"}>
                                                        {event.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.organizationName} • Submitted {format(new Date(event.createdAt), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/manage/admin/events/${event.id}`}>Review details</Link>
                                                </Button>
                                                <Button asChild size="sm" variant="secondary">
                                                    <Link href={`/manage/admin/events`}>Open queue</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

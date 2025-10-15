"use client";

import React, {useMemo} from "react";
import {useParams} from "next/navigation";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {RefreshCcw} from "lucide-react";
import {WelcomeBar} from "./_components/WelcomeBar";
import {StatsCard} from "./_components/StatsCard";
import {RevenueChart} from "./_components/RevenueChart";
import {SessionStatusChart} from "./_components/SessionStatusChart";
import {AudienceViewsChart} from "./_components/AudienceViewsChart";
import {EventsTable} from "./_components/EventsTable";
import {SessionsTable} from "./_components/SessionsTable";
import {useOrganization} from "@/providers/OrganizationProvider";
import {useOrganizationDashboardData} from "./_hooks/useOrganizationDashboardData";
import {formatCurrency} from "@/lib/utils";
import {DailySalesMetrics} from "@/lib/actions/analyticsActions";
import {EventSummaryDTO} from "@/lib/validators/event";
import {DeviceBreakdownChart} from "./_components/DeviceBreakdownChart";
import {TrafficSourcesChart} from "./_components/TrafficSourcesChart";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const OrganizationDashboardPage = () => {
    const params = useParams();
    const organizationId = params?.organization_id as string | undefined;
    const {organization} = useOrganization();

    const {
        data,
        loading,
        highlightedEvents,
        sessionStatusTotals,
        error,
        refetch,
    } = useOrganizationDashboardData(organizationId);

    const summarizedDailyTickets = useMemo(() => {
        return data.revenue.dailySales.reduce<number>((acc, item: DailySalesMetrics) => acc + item.tickets_sold, 0);
    }, [data.revenue.dailySales]);

    const approvedOrCompletedCount = useMemo(() => {
        return data.events.filter((event: EventSummaryDTO) => event.status === "APPROVED" || event.status === "COMPLETED").length;
    }, [data.events]);

    const pendingEventsCount = useMemo(() => {
        return data.events.filter((event: EventSummaryDTO) => event.status === "PENDING").length;
    }, [data.events]);

    const discountShare = useMemo(() => {
        const totalBefore = data.revenue.totalBeforeDiscounts ?? 0;
        const totalNet = data.revenue.totalRevenue ?? 0;

        if (totalBefore <= 0) {
            return undefined;
        }

        const rawRatio = 1 - totalNet / totalBefore;
        const clamped = Math.max(0, Math.min(rawRatio, 1));
        return `${Math.round(clamped * 100)}%`;
    }, [data.revenue.totalBeforeDiscounts, data.revenue.totalRevenue]);

    const sessionStatusSummary = useMemo(() => {
        const segments = [
            {label: "On sale", value: sessionStatusTotals.ON_SALE},
            {label: "Scheduled", value: sessionStatusTotals.SCHEDULED},
            {label: "Sold out", value: sessionStatusTotals.SOLD_OUT},
            {label: "Closed", value: sessionStatusTotals.CLOSED},
        ].filter(segment => segment.value > 0);

        if (segments.length === 0) {
            return undefined;
        }

        return segments
            .map(segment => `${segment.value.toLocaleString("en-LK")} ${segment.label}`)
            .join(" • ");
    }, [sessionStatusTotals]);

    if (!organizationId) {
        return (
            <div className="p-6 md:p-8">
                <Alert variant="destructive">
                    <AlertTitle>Missing organization context</AlertTitle>
                    <AlertDescription>
                        We couldn&apos;t determine which organization to load. Please navigate from your organizations list.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8">
            <WelcomeBar
                organizationName={organization?.name}
                totalRevenue={data?.revenue.totalRevenue}
                organizationId={organizationId}
                isLoading={loading.revenue || loading.events}
            />

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

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatsCard
                    title="Total revenue"
                    value={formatCurrency(data?.revenue.totalRevenue ?? 0, "LKR", "en-LK")}
                    subtitle={data?.revenue.totalBeforeDiscounts
                        ? `${formatCurrency(data.revenue.totalBeforeDiscounts, "LKR", "en-LK")} before discounts`
                        : undefined}
                    trendLabel="Tickets sold"
                    trendValue={summarizedDailyTickets.toLocaleString("en-LK")}
                    trendVariant="positive"
                    isLoading={loading.revenue}
                />
                <StatsCard
                    title="Discounts given"
                    value={formatCurrency(data?.revenue.totalDiscounts ?? 0, "LKR", "en-LK")}
                    subtitle="Across all campaigns"
                    trendLabel={discountShare ? "Share of gross" : undefined}
                    trendValue={discountShare}
                    trendVariant="neutral"
                    isLoading={loading.revenue}
                />
                <StatsCard
                    title="Sessions tracked"
                    value={(data?.sessionAnalytics?.totalSessions ?? 0).toLocaleString("en-LK")}
                    subtitle={`Across ${data?.events.length ?? 0} events`}
                    trendLabel={sessionStatusSummary ? "Status mix" : undefined}
                    trendValue={sessionStatusSummary}
                    trendVariant="neutral"
                    isLoading={loading.sessionAnalytics}
                />
                <StatsCard
                    title="Events live"
                    value={approvedOrCompletedCount.toLocaleString("en-LK")}
                    subtitle="Approved or completed"
                    trendLabel="Pending approval"
                    trendValue={pendingEventsCount.toLocaleString("en-LK")}
                    trendVariant="warning"
                    isLoading={loading.events}
                />
                <StatsCard
                    title="Audience reach"
                    value={(data?.audience.totalViews ?? 0).toLocaleString("en-LK")}
                    subtitle="Total views (30 days)"
                    trendLabel="Unique viewers"
                    trendValue={(data?.audience.uniqueUsers ?? 0).toLocaleString("en-LK")}
                    trendVariant="neutral"
                    isLoading={loading.audience}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <RevenueChart
                        data={data?.revenue.dailySales ?? []}
                        isLoading={loading.revenue}
                    />
                </div>
                <div className="xl:col-span-4">
                    <SessionStatusChart
                        analytics={data?.sessionAnalytics ?? null}
                        totals={sessionStatusTotals}
                        isLoading={loading.sessionAnalytics}
                    />
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <AudienceViewsChart
                        data={data?.audience.viewsTimeSeries ?? []}
                        totalViews={data?.audience.totalViews ?? 0}
                        isLoading={loading.audience}
                    />
                </div>
                <div className="xl:col-span-4">
                    <Tabs defaultValue="devices" className="h-full">
                        <TabsList className="ml-auto">
                            <TabsTrigger value="devices">Device mix</TabsTrigger>
                            <TabsTrigger value="traffic">Traffic sources</TabsTrigger>
                        </TabsList>
                        <TabsContent value="devices" className="h-full">
                            <DeviceBreakdownChart
                                data={data?.audience.deviceBreakdown ?? []}
                                totalViews={data?.audience.totalViews ?? 0}
                                isLoading={loading.audience}
                            />
                        </TabsContent>
                        <TabsContent value="traffic" className="h-full">
                            <TrafficSourcesChart
                                data={data?.audience.trafficSources ?? []}
                                totalViews={data?.audience.totalViews ?? 0}
                                isLoading={loading.audience}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <EventsTable
                    events={highlightedEvents}
                    organizationId={organizationId}
                    isLoading={loading.highlightedEvents}
                />
                <SessionsTable
                    sessions={data?.sessions ?? []}
                    organizationId={organizationId}
                    isLoading={loading.sessions}
                />
            </section>
        </div>
    );
};

export default OrganizationDashboardPage;
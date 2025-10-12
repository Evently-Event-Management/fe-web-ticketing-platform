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
import {EventsTable} from "./_components/EventsTable";
import {SessionsTable} from "./_components/SessionsTable";
import {useOrganization} from "@/providers/OrganizationProvider";
import {useOrganizationDashboardData} from "./_hooks/useOrganizationDashboardData";
import {formatCurrency} from "@/lib/utils";
import {DailySalesMetrics} from "@/lib/actions/analyticsActions";
import {EventSummaryDTO} from "@/lib/validators/event";

const OrganizationDashboardPage = () => {
    const params = useParams();
    const organizationId = params?.organization_id as string | undefined;
    const {organization} = useOrganization();

    const {
        data,
        highlightedEvents,
        sessionStatusTotals,
        isLoading,
        error,
        refetch,
    } = useOrganizationDashboardData(organizationId);

    const summarizedDailyTickets = useMemo(() => {
        if (!data?.revenue.dailySales) {
            return 0;
        }
        return data.revenue.dailySales.reduce<number>((acc, item: DailySalesMetrics) => acc + item.tickets_sold, 0);
    }, [data?.revenue.dailySales]);

    const approvedOrCompletedCount = useMemo(() => {
        if (!data?.events) {
            return 0;
        }
        return data.events.filter((event: EventSummaryDTO) => event.status === "APPROVED" || event.status === "COMPLETED").length;
    }, [data?.events]);

    const pendingEventsCount = useMemo(() => {
        if (!data?.events) {
            return 0;
        }
        return data.events.filter((event: EventSummaryDTO) => event.status === "PENDING").length;
    }, [data?.events]);

    const discountShare = useMemo(() => {
        const totalBefore = data?.revenue?.totalBeforeDiscounts ?? 0;
        const totalNet = data?.revenue?.totalRevenue ?? 0;

        if (totalBefore <= 0) {
            return undefined;
        }

        const rawRatio = 1 - totalNet / totalBefore;
        const clamped = Math.max(0, Math.min(rawRatio, 1));
        return `${Math.round(clamped * 100)}%`;
    }, [data?.revenue?.totalBeforeDiscounts, data?.revenue?.totalRevenue]);

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
                isLoading={isLoading}
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
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Discounts given"
                    value={formatCurrency(data?.revenue.totalDiscounts ?? 0, "LKR", "en-LK")}
                    subtitle="Across all campaigns"
                    trendLabel={discountShare ? "Share of gross" : undefined}
                    trendValue={discountShare}
                    trendVariant="neutral"
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Sessions tracked"
                    value={(data?.sessionAnalytics?.totalSessions ?? 0).toLocaleString("en-LK")}
                    subtitle={`Across ${data?.events.length ?? 0} events`}
                    trendLabel="On sale now"
                    trendValue={sessionStatusTotals.ON_SALE.toLocaleString("en-LK")}
                    trendVariant="positive"
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Events live"
                    value={approvedOrCompletedCount.toLocaleString("en-LK")}
                    subtitle="Approved or completed"
                    trendLabel="Pending approval"
                    trendValue={pendingEventsCount.toLocaleString("en-LK")}
                    trendVariant="warning"
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Audience reach"
                    value={(data?.organizationReach ?? 0).toLocaleString("en-LK")}
                    subtitle="Unique viewers (30 days)"
                    trendLabel="Events tracked"
                    trendValue={(data?.events.length ?? 0).toLocaleString("en-LK")}
                    trendVariant="neutral"
                    isLoading={isLoading}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-7">
                    <RevenueChart
                        data={data?.revenue.dailySales ?? []}
                        isLoading={isLoading}
                    />
                </div>
                <div className="xl:col-span-5">
                    <SessionStatusChart
                        analytics={data?.sessionAnalytics ?? null}
                        totals={sessionStatusTotals}
                        isLoading={isLoading}
                    />
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <EventsTable
                    events={highlightedEvents}
                    organizationId={organizationId}
                    isLoading={isLoading}
                />
                <SessionsTable
                    sessions={data?.sessions ?? []}
                    organizationId={organizationId}
                    isLoading={isLoading}
                />
            </section>
        </div>
    );
};

export default OrganizationDashboardPage;
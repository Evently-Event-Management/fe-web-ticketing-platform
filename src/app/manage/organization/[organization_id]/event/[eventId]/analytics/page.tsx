"use client"

import {useEffect, useState, useCallback} from "react";
import {EventAnalytics, SessionSummary} from "@/types/eventAnalytics";
import {getBatchedGaInsights} from "@/lib/actions/public/server/eventActions";
import {EventAnalyticsView} from "./_components/EventAnalyticsView";
import {SessionPerformanceGrid} from "./_components/SessionPerformanceGrid";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllSessionsAnalytics, getEventAnalytics, getEventRevenueAnalytics} from "@/lib/actions/analyticsActions";
import {AlertTriangle, RefreshCw} from "lucide-react";
import {useEventContext} from "@/providers/EventProvider";
import {Button} from "@/components/ui/button";

export default function AnalyticsPage() {
    const {
        event,
        isLoading: isEventLoading,
        seedRevenueSnapshot,
    } = useEventContext();
    const [analyticsData, setAnalyticsData] = useState<EventAnalytics | null>(null);
    const [revenueAnalytics, setRevenueAnalytics] = useState<{
        total_revenue: number;
        total_before_discounts: number;
        total_tickets_sold: number;
        daily_sales: Array<{date: string; revenue: number; tickets_sold: number}>;
        sales_by_tier?: Array<{
            tier_id: string;
            tier_name: string;
            tier_color: string;
            tickets_sold: number;
            revenue: number;
        }>;
    } | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
    const [isRevenueLoading, setIsRevenueLoading] = useState(true);
    const [isGaLoading, setIsGaLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch revenue analytics data (new)
    const fetchRevenueAnalytics = useCallback(async () => {
        if (!event?.id) return;

        try {
            setIsRevenueLoading(true);

            const revenueData = await getEventRevenueAnalytics(event.id);
            setRevenueAnalytics(revenueData);
            seedRevenueSnapshot({
                totalRevenue: revenueData?.total_revenue,
                totalTickets: revenueData?.total_tickets_sold,
            });
        } catch (err) {
            console.error("Failed to load revenue analytics:", err);
            // Don't set main error state since this is supplementary data
        } finally {
            setIsRevenueLoading(false);
        }
    }, [event?.id, seedRevenueSnapshot]);

    // Fetch analytics data (page-specific)
    const fetchAnalyticsData = useCallback(async () => {
        if (!event?.id) return;

        try {
            setIsAnalyticsLoading(true);
            setError(null);

            const [coreData, sessionsData] = await Promise.all([
                getEventAnalytics(event.id),
                getAllSessionsAnalytics(event.id),
            ]);

            setAnalyticsData(coreData);
            setSessions(sessionsData);
        } catch (err) {
            setError("Failed to load event analytics data.");
            console.error(err);
        } finally {
            setIsAnalyticsLoading(false);
        }
    }, [event?.id]);

    // Fetch Google Analytics data (page-specific)
    const fetchGaData = useCallback(async () => {
        if (!event?.id) return;

        try {
            setIsGaLoading(true);

            const gaResult = await getBatchedGaInsights(event.id);

            if (gaResult.success && gaResult.data) {
                // Update analyticsData with GA insights if core data is already loaded
                setAnalyticsData(prevData => {
                    if (!prevData) return null;

                    // Calculate conversion rate
                    const totalViews = gaResult.data?.totalViews;
                    const conversionRate = totalViews && totalViews > 0
                        ? (prevData.totalTicketsSold / totalViews) * 100
                        : 0;

                    return {
                        ...prevData,
                        pageViews: totalViews,
                        conversionRate,
                        viewsTimeSeries: gaResult.data?.viewsTimeSeries,
                        trafficSources: gaResult.data?.trafficSources,
                        audienceGeography: gaResult.data?.audienceGeography,
                        deviceBreakdown: gaResult.data?.deviceBreakdown
                    };
                });
            }
        } catch (err) {
            console.error("Failed to load Google Analytics data:", err);
            // We don't set the main error state here since GA data is supplementary
        } finally {
            setIsGaLoading(false);
        }
    }, [event?.id]);

    // Function to refresh all analytics data
    // Initial load of analytics data when event is loaded
    useEffect(() => {
        if (event?.id) {
            fetchAnalyticsData();
            fetchRevenueAnalytics();
            fetchGaData();
        }
    }, [event?.id, fetchAnalyticsData, fetchRevenueAnalytics, fetchGaData]);

    if (isEventLoading) {
        return <div className="p-8"><Skeleton className="h-[600px] w-full"/></div>;
    }

    if (!event) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive"/>
                </div>
                <h2 className="text-xl font-semibold text-destructive">Event not found</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive"/>
                </div>
                <h2 className="text-xl font-semibold text-destructive">{error}</h2>
                <p className="text-muted-foreground mt-2">
                    Please wait for the event to be approved by an administrator.
                </p>
            </div>
        );
    }

    // Show skeleton while analytics data is loading
    if (isAnalyticsLoading || !analyticsData) {
        return <div className="p-8"><Skeleton className="h-[600px] w-full"/></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">Analytics deep dive</h2>
                    <p className="text-sm text-muted-foreground">
                        Refresh revenue totals as needed while the live hero keeps streaming new orders automatically.
                    </p>
                </div>
                <Button
                    onClick={() => { void fetchRevenueAnalytics(); }}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRevenueLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isRevenueLoading ? "animate-spin" : ""}`}/>
                    Refresh revenue data
                </Button>
            </div>

            <EventAnalyticsView
                analytics={analyticsData}
                revenueAnalytics={revenueAnalytics || undefined}
                isGaLoading={isGaLoading}
                isRevenueLoading={isRevenueLoading}
            />
            <SessionPerformanceGrid sessions={sessions} isLoading={isAnalyticsLoading} />
        </div>
    );
}

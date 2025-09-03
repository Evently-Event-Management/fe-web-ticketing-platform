"use client"

import {useEffect, useState} from "react";
import {EventAnalytics, SessionSummary} from "@/types/eventAnalytics";
import {getBatchedGaInsights} from "@/lib/actions/public/server/eventActions";
import {EventAnalyticsView} from "./_components/EventAnalyticsView";
import {columns} from "./_components/SessionTableColumns";
import {DataTable} from "@/components/DataTable";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllSessionsAnalytics, getEventAnalytics} from "@/lib/actions/public/analyticsActions";

type AnalyticsPageProps = { params: { eventId: string; } }

export default function AnalyticsPage({params}: AnalyticsPageProps) {
    const {eventId} = params;
    const [analyticsData, setAnalyticsData] = useState<EventAnalytics | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isEventLoading, setIsEventLoading] = useState(true);
    const [isGaLoading, setIsGaLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch core event data
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setIsEventLoading(true);
                const [coreData, sessionsData] = await Promise.all([
                    getEventAnalytics(eventId),
                    getAllSessionsAnalytics(eventId),
                ]);

                setAnalyticsData(coreData);
                setSessions(sessionsData);
            } catch (err) {
                setError("Failed to load event analytics data.");
                console.error(err);
            } finally {
                setIsEventLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    // Fetch Google Analytics data separately
    useEffect(() => {
        const fetchGaData = async () => {
            try {
                setIsGaLoading(true);
                const gaResult = await getBatchedGaInsights(eventId);

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
        };

        fetchGaData();
    }, [eventId]);

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    // Show skeleton while core event data is loading
    if (isEventLoading || !analyticsData) {
        return <div className="p-8"><Skeleton className="h-[600px] w-full"/></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{analyticsData.eventTitle}</h1>
                <p className="text-muted-foreground">Overall Event Analytics Dashboard</p>
            </div>
            <EventAnalyticsView
                analytics={analyticsData}
                isGaLoading={isGaLoading}
            />
            <DataTable columns={columns} data={sessions} isLoading={isEventLoading}/>
        </div>
    );
}

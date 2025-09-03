"use client"

import {useEffect, useState} from "react";
import {EventAnalytics, SessionSummary} from "@/types/eventAnalytics";
import {getBatchedGaInsights} from "@/lib/actions/public/server/eventActions";
import {EventAnalyticsView} from "./_components/EventAnalyticsView";
import {columns} from "./_components/SessionTableColumns";
import {DataTable} from "@/components/DataTable";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllSessionsAnalytics, getEventAnalytics} from "@/lib/actions/public/analyticsActions";
import { AlertTriangle } from "lucide-react";
import {useParams} from "next/navigation";


export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<EventAnalytics | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isEventLoading, setIsEventLoading] = useState(true);
    const [isGaLoading, setIsGaLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const eventId = params.eventId as string;

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
        return (
            <div
                className="container mx-auto p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]">
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

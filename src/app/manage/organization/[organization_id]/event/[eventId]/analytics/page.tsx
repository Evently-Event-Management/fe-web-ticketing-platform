"use client"

import {useEffect, useState} from "react";
import {EventAnalytics, SessionSummary} from "@/types/eventAnalytics";
import {EventAnalyticsView} from "./_components/EventAnalyticsView";
import {columns} from "./_components/SessionTableColumns";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllSessionsAnalytics, getEventAnalytics} from "@/lib/actions/public/analyticsActions";
import {DataTable} from "@/components/DataTable";
import {useParams} from "next/navigation";

export default function AnalyticsPage() {
    const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const eventId = params.eventId as string;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [eventData, sessionsData] = await Promise.all([
                    getEventAnalytics(eventId),
                    getAllSessionsAnalytics(eventId)
                ]);
                setEventAnalytics(eventData);
                setSessions(sessionsData);
            } catch (err) {
                setError("Failed to load analytics data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            {isLoading || !eventAnalytics ? (
                <div>
                    <Skeleton className="h-8 w-1/2 mb-4"/>
                    <Skeleton className="h-6 w-1/3 mb-8"/>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32"/>)}
                    </div>
                    <Skeleton className="h-[400px]"/>
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{eventAnalytics.eventTitle}</h1>
                        <p className="text-muted-foreground">Overall Event Analytics</p>
                    </div>
                    <EventAnalyticsView analytics={eventAnalytics}/>
                    <DataTable columns={columns} data={sessions} isLoading={isLoading}/>
                </>
            )}
        </div>
    );
}
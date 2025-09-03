"use client"

import {useEffect, useState} from "react";
import {SessionAnalytics} from "@/types/eventAnalytics";
import {SessionAnalyticsView} from "../_components/SessionAnalyticsView";
import {Skeleton} from "@/components/ui/skeleton";
import {getSessionAnalytics} from "@/lib/actions/public/analyticsActions";
import {useParams} from "next/navigation";

export default function SessionAnalyticsPage() {
    const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const eventId = params.eventId as string;
    const sessionId = params.sessionId as string;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getSessionAnalytics(eventId, sessionId);
                setSessionAnalytics(data);
            } catch (err) {
                setError("Failed to load session analytics.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [eventId, sessionId]);

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    if (isLoading || !sessionAnalytics) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-8 w-1/4 mb-4"/>
                <Skeleton className="h-6 w-1/2 mb-8"/>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32"/>)}
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Skeleton className="h-[300px]"/>
                    <Skeleton className="h-[300px]"/>
                </div>
            </div>
        );
    }

    return <SessionAnalyticsView analytics={sessionAnalytics}/>;
}
"use client"

import {useEffect, useState, useCallback} from "react";
import {SessionAnalytics} from "@/types/eventAnalytics";
import {SessionAnalyticsView} from "../_components/SessionAnalyticsView";
import {Skeleton} from "@/components/ui/skeleton";
import {getSessionAnalytics} from "@/lib/actions/public/analyticsActions";
import {useParams} from "next/navigation";
import {getSessionAnalytics as getSessionRevenueAnalytics} from "@/lib/actions/analyticsActions";

export default function SessionAnalyticsPage() {
    const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);
    const [revenueAnalytics, setRevenueAnalytics] = useState<{
        total_revenue: number;
        total_before_discounts: number;
        total_tickets_sold: number;
        daily_sales: Array<{date: string; revenue: number; tickets_sold: number}>;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevenueLoading, setIsRevenueLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const eventId = params.eventId as string;
    const sessionId = params.sessionId as string;

    // Fetch core session data
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
    
    // Fetch session revenue analytics data
    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setIsRevenueLoading(true);
                const data = await getSessionRevenueAnalytics(eventId, sessionId);
                setRevenueAnalytics(data);
            } catch (err) {
                console.error("Failed to load revenue analytics data:", err);
                // Don't set main error state since this is supplementary data
            } finally {
                setIsRevenueLoading(false);
            }
        };
        
        if (eventId && sessionId) {
            fetchRevenueData();
        }
    }, [eventId, sessionId]);

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    if (isLoading || !sessionAnalytics) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-8 w-1/4 mb-4"/>
                <Skeleton className="h-6 w-1/2 mb-8"/>
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32"/>)}
                </div>
                <Skeleton className="w-full h-[350px] mb-8"/>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Skeleton className="h-[300px]"/>
                    <Skeleton className="h-[300px]"/>
                </div>
            </div>
        );
    }

    return (
        <SessionAnalyticsView 
            analytics={sessionAnalytics} 
            sessionAnalytics={revenueAnalytics || undefined} 
            isLoading={isRevenueLoading}
        />
    );
}
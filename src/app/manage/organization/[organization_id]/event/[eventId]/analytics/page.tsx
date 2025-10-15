"use client"

import {useEffect, useState, useCallback, useRef} from "react";
import {EventAnalytics, SessionSummary} from "@/types/eventAnalytics";
import {getBatchedGaInsights} from "@/lib/actions/public/server/eventActions";
import {EventAnalyticsView} from "./_components/EventAnalyticsView";
import {SessionPerformanceGrid} from "./_components/SessionPerformanceGrid";
import {Skeleton} from "@/components/ui/skeleton";
import {getAllSessionsAnalytics, getEventAnalytics, getEventRevenueAnalytics} from "@/lib/actions/analyticsActions";
import { AlertTriangle } from "lucide-react";
import { useEventContext } from "@/providers/EventProvider";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {subscribeToSse} from "@/lib/api";
import {OrderCheckoutSseEvent, StreamingTicket} from "@/types/order";
import {parseOrderCheckoutEvent} from "@/lib/orderSseUtils";

export default function AnalyticsPage() {
    const { event, isLoading: isEventLoading } = useEventContext();
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
    const processedOrderIdsRef = useRef<Set<string>>(new Set());

    // Fetch revenue analytics data (new)
    const fetchRevenueAnalytics = useCallback(async () => {
        if (!event?.id) return;
        
        try {
            setIsRevenueLoading(true);
            
            const revenueData = await getEventRevenueAnalytics(event.id);
            setRevenueAnalytics(revenueData);
        } catch (err) {
            console.error('Failed to load revenue analytics:', err);
            // Don't set main error state since this is supplementary data
        } finally {
            setIsRevenueLoading(false);
        }
    }, [event?.id]);

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
    const refreshAllData = useCallback(() => {
        fetchAnalyticsData();
        fetchRevenueAnalytics();
        fetchGaData();
    }, [fetchAnalyticsData, fetchRevenueAnalytics, fetchGaData]);

    useEffect(() => {
        processedOrderIdsRef.current.clear();
    }, [event?.id]);

    useEffect(() => {
        if (!event?.id) {
            return;
        }

        const toNumber = (value: number | string | null | undefined): number => {
            if (typeof value === "number") {
                return value;
            }
            if (typeof value === "string") {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : 0;
            }
            return 0;
        };

        const unsubscribe = subscribeToSse<OrderCheckoutSseEvent>(
            `/order/sse/checkouts/event/${event.id}`,
            {
                onMessage: ({event: eventName, data}) => {
                    if (eventName && eventName.toUpperCase() === "CONNECTED") {
                        return;
                    }

                    if (eventName && eventName.toUpperCase() !== "CHECKOUT") {
                        return;
                    }

                    if (!data) {
                        return;
                    }

                    const parsed = parseOrderCheckoutEvent(data);

                    if (!parsed.orderId) {
                        return;
                    }

                    if (processedOrderIdsRef.current.has(parsed.orderId)) {
                        return;
                    }

                    processedOrderIdsRef.current.add(parsed.orderId);

                    const revenueIncrease = parsed.revenue;

                    const tickets = Array.isArray(data.tickets)
                        ? data.tickets
                        : Array.isArray(data.Tickets)
                            ? data.Tickets as StreamingTicket[]
                            : [];

                    const ticketCount = parsed.ticketCount || tickets.length;

                    if (revenueIncrease <= 0 && ticketCount === 0) {
                        return;
                    }

                    setAnalyticsData(prev => {
                        if (!prev) {
                            return prev;
                        }

                        const updatedRevenue = revenueIncrease > 0 ? prev.totalRevenue + revenueIncrease : prev.totalRevenue;
                        const updatedTickets = ticketCount > 0 ? prev.totalTicketsSold + ticketCount : prev.totalTicketsSold;
                        const averageRevenue = updatedTickets > 0 ? updatedRevenue / updatedTickets : prev.averageRevenuePerTicket;

                        const updatedTierSales = Array.isArray(prev.salesByTier) && prev.salesByTier.length > 0 && ticketCount > 0
                            ? prev.salesByTier.map(tier => {
                                const tierTicketsForTier = tickets
                                    ?.filter(ticket => ticket.tier_id === tier.tierId);

                                const tierIncrement = tierTicketsForTier
                                    ?.reduce((acc, ticket) => acc + toNumber(ticket.price_at_purchase), 0) ?? 0;
                                const tierTicketsCount = tierTicketsForTier?.length ?? 0;

                                if (tierIncrement === 0 && tierTicketsCount === 0) {
                                    return tier;
                                }

                                return {
                                    ...tier,
                                    totalRevenue: tier.totalRevenue + tierIncrement,
                                    ticketsSold: tier.ticketsSold + tierTicketsCount,
                                };
                            })
                            : prev.salesByTier;

                        return {
                            ...prev,
                            totalRevenue: updatedRevenue,
                            totalTicketsSold: updatedTickets,
                            averageRevenuePerTicket: averageRevenue,
                            salesByTier: updatedTierSales,
                        };
                    });

                    setRevenueAnalytics(prev => {
                        if (!prev) {
                            return prev;
                        }

                        const updatedRevenue = revenueIncrease > 0 ? prev.total_revenue + revenueIncrease : prev.total_revenue;
                        const updatedTickets = ticketCount > 0 ? prev.total_tickets_sold + ticketCount : prev.total_tickets_sold;

                        const tierAdjustments = tickets.reduce<Record<string, {count: number; revenue: number}>>((acc, ticket) => {
                            const key = ticket.tier_id;
                            if (!key) {
                                return acc;
                            }
                            if (!acc[key]) {
                                acc[key] = {count: 0, revenue: 0};
                            }
                            acc[key].count += 1;
                            acc[key].revenue += toNumber(ticket.price_at_purchase);
                            return acc;
                        }, {});

                        const updatedSalesByTier = Array.isArray(prev.sales_by_tier) && prev.sales_by_tier.length > 0
                            ? prev.sales_by_tier.map(tier => {
                                const adjustment = tierAdjustments[tier.tier_id];
                                if (!adjustment) {
                                    return tier;
                                }
                                return {
                                    ...tier,
                                    tickets_sold: tier.tickets_sold + adjustment.count,
                                    revenue: tier.revenue + adjustment.revenue,
                                };
                            })
                            : prev.sales_by_tier;

                        return {
                            ...prev,
                            total_revenue: updatedRevenue,
                            total_tickets_sold: updatedTickets,
                            sales_by_tier: updatedSalesByTier,
                        };
                    });
                },
                onError: (streamError) => {
                    console.error("Event analytics SSE error", streamError);
                },
            },
        );

        return unsubscribe;
    }, [event?.id]);

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
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{analyticsData.eventTitle}</h1>
                    <p className="text-muted-foreground">Overall Event Analytics Dashboard</p>
                </div>
                <Button
                    onClick={refreshAllData}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isAnalyticsLoading || isGaLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${(isAnalyticsLoading || isGaLoading) ? 'animate-spin' : ''}`} />
                    Refresh Data
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

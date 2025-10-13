"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {getMyOrganizationEvents} from "@/lib/actions/eventActions";
import {
    DailySalesMetrics,
    EventOrderAnalyticsBatchResponse,
    getEventOrderAnalyticsBatch,
} from "@/lib/actions/analyticsActions";
import {
    getOrganizationSessionAnalytics,
    getOrganizationSessions,
    OrganizationSessionDTO,
    SessionAnalyticsResponse
} from "@/lib/actions/statsActions";
import {EventSummaryDTO, EventStatus} from "@/lib/validators/event";
import {SessionStatus} from "@/types/enums/sessionStatus";
import {PaginatedResponse} from "@/types/paginatedResponse";
import {DeviceBreakdown, TimeSeriesData, TrafficSource} from "@/types/eventAnalytics";

interface OrganizationDashboardData {
    events: EventSummaryDTO[];
    sessions: OrganizationSessionDTO[];
    sessionAnalytics: SessionAnalyticsResponse | null;
    revenue: {
        totalRevenue: number;
        totalBeforeDiscounts: number;
        totalDiscounts: number;
        dailySales: DailySalesMetrics[];
    };
    audience: {
        totalViews: number;
        uniqueUsers: number;
        viewsTimeSeries: TimeSeriesData[];
        deviceBreakdown: DeviceBreakdown[];
        trafficSources: TrafficSource[];
    };
}

interface UseOrganizationDashboardDataOptions {
    highlightedEventCount?: number;
    highlightedSessionCount?: number;
}

const DEFAULT_OPTIONS: Required<UseOrganizationDashboardDataOptions> = {
    highlightedEventCount: 3,
    highlightedSessionCount: 4,
};

const PAGE_SIZE_FOR_EVENTS = 50;

type DashboardLoadingKey =
    | "revenue"
    | "audience"
    | "events"
    | "sessions"
    | "sessionAnalytics"
    | "highlightedEvents";

type DashboardLoadingState = Record<DashboardLoadingKey, boolean>;

const createEmptyRevenue = (): OrganizationDashboardData["revenue"] => ({
    totalRevenue: 0,
    totalBeforeDiscounts: 0,
    totalDiscounts: 0,
    dailySales: [],
});

const createEmptyAudience = (): OrganizationDashboardData["audience"] => ({
    totalViews: 0,
    uniqueUsers: 0,
    viewsTimeSeries: [],
    deviceBreakdown: [],
    trafficSources: [],
});

const EMPTY_DASHBOARD: OrganizationDashboardData = {
    events: [],
    sessions: [],
    sessionAnalytics: null,
    revenue: createEmptyRevenue(),
    audience: createEmptyAudience(),
};

const createInitialLoadingState = (): DashboardLoadingState => ({
    revenue: true,
    audience: true,
    events: true,
    sessions: true,
    sessionAnalytics: true,
    highlightedEvents: true,
});

const uniqueDailySales = (batch: EventOrderAnalyticsBatchResponse | null): DailySalesMetrics[] => {
    if (!batch) {
        return [];
    }

    // Combine sales by date in case backend sends duplicates or unsorted entries
    const grouped = batch.daily_sales.reduce<Record<string, DailySalesMetrics>>((acc, item) => {
        const key = item.date;
        if (!acc[key]) {
            acc[key] = {
                date: item.date,
                revenue: item.revenue,
                tickets_sold: item.tickets_sold,
            };
        } else {
            acc[key].revenue += item.revenue;
            acc[key].tickets_sold += item.tickets_sold;
        }
        return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const mapSessionStatusTotals = (analytics: SessionAnalyticsResponse | null): Record<SessionStatus, number> => {
    const base: Record<SessionStatus, number> = {
        [SessionStatus.PENDING]: 0,
        [SessionStatus.SCHEDULED]: 0,
        [SessionStatus.ON_SALE]: 0,
        [SessionStatus.SOLD_OUT]: 0,
        [SessionStatus.CLOSED]: 0,
        [SessionStatus.CANCELED]: 0,
    };

    if (!analytics) {
        return base;
    }

    analytics.sessionsByStatus.forEach(({status, count}) => {
        if (status in base) {
            base[status as SessionStatus] = count;
        }
    });

    return base;
};

export const useOrganizationDashboardData = (
    organizationId: string | undefined,
    options: UseOrganizationDashboardDataOptions = {}
) => {
    const {highlightedEventCount, highlightedSessionCount} = {...DEFAULT_OPTIONS, ...options};

    const [data, setData] = useState<OrganizationDashboardData>(EMPTY_DASHBOARD);
    const [highlightedEvents, setHighlightedEvents] = useState<EventSummaryDTO[]>([]);
    const [sessionStatusTotals, setSessionStatusTotals] = useState<Record<SessionStatus, number>>(
        () => mapSessionStatusTotals(null),
    );
    const [loadingState, setLoadingState] = useState<DashboardLoadingState>(() => createInitialLoadingState());
    const [error, setError] = useState<string | null>(null);

    const markSectionComplete = useCallback((section: DashboardLoadingKey | DashboardLoadingKey[]) => {
        setLoadingState(prev => {
            const sections = Array.isArray(section) ? section : [section];
            return sections.reduce<DashboardLoadingState>((acc, key) => {
                acc[key] = false;
                return acc;
            }, {...prev});
        });
    }, []);

    const fetchEventsAcrossPages = useCallback(async (): Promise<EventSummaryDTO[]> => {
        if (!organizationId) {
            return [];
        }

        const events: EventSummaryDTO[] = [];
        let page = 0;
        let totalPages = 1;

        do {
            const response: PaginatedResponse<EventSummaryDTO> = await getMyOrganizationEvents(
                organizationId,
                undefined,
                undefined,
                page,
                PAGE_SIZE_FOR_EVENTS
            );
            events.push(...response.content);
            totalPages = response.totalPages;
            page += 1;
        } while (page < totalPages);

        return events;
    }, [organizationId]);

    const loadDashboard = useCallback(async () => {
        if (!organizationId) {
            setData(EMPTY_DASHBOARD);
            setHighlightedEvents([]);
            setSessionStatusTotals(mapSessionStatusTotals(null));
            setLoadingState({
                revenue: false,
                audience: false,
                events: false,
                sessions: false,
                sessionAnalytics: false,
                highlightedEvents: false,
            });
            setError("Missing organization identifier");
            return;
        }

        setError(null);
        setLoadingState(createInitialLoadingState());

        const tasks: Promise<void>[] = [];

        tasks.push((async () => {
            try {
                const events = await fetchEventsAcrossPages();
                const sortedEvents = events
                    .slice()
                    .sort((a, b) => new Date(a.earliestSessionDate).getTime() - new Date(b.earliestSessionDate).getTime());
                setData(prev => ({...prev, events: sortedEvents}));

                if (sortedEvents.length === 0) {
                    setData(prev => ({...prev, revenue: createEmptyRevenue()}));
                    return;
                }

                try {
                    const revenueBatch = await getEventOrderAnalyticsBatch(sortedEvents.map(event => event.id));
                    const dailySales = uniqueDailySales(revenueBatch);
                    const totalRevenue = revenueBatch?.total_revenue ?? 0;
                    const totalBeforeDiscounts = revenueBatch?.total_before_discounts ?? totalRevenue;
                    const totalDiscounts = Math.max(totalBeforeDiscounts - totalRevenue, 0);

                    setData(prev => ({
                        ...prev,
                        revenue: {
                            totalRevenue,
                            totalBeforeDiscounts,
                            totalDiscounts,
                            dailySales,
                        },
                    }));
                } catch (revenueError) {
                    console.error("Failed to fetch revenue analytics batch", revenueError);
                    setError(prev => prev ?? "Some revenue metrics failed to load.");
                    setData(prev => ({...prev, revenue: createEmptyRevenue()}));
                }
            } catch (eventError) {
                console.error("Failed to fetch organization events", eventError);
                setError(prev => prev ?? "Event information failed to load.");
                setData(prev => ({
                    ...prev,
                    events: [],
                    revenue: createEmptyRevenue(),
                }));
            } finally {
                markSectionComplete(["events", "revenue"]);
            }
        })());

        tasks.push((async () => {
            try {
                const [sessionAnalytics, sessionsResponse] = await Promise.all([
                    getOrganizationSessionAnalytics(organizationId),
                    getOrganizationSessions(organizationId, SessionStatus.ON_SALE, 0, highlightedSessionCount),
                ]);

                setData(prev => ({
                    ...prev,
                    sessions: sessionsResponse.content,
                    sessionAnalytics,
                }));
                setSessionStatusTotals(mapSessionStatusTotals(sessionAnalytics));
            } catch (sessionError) {
                console.error("Failed to fetch session analytics", sessionError);
                setError(prev => prev ?? "Session metrics failed to load.");
                setData(prev => ({
                    ...prev,
                    sessions: [],
                    sessionAnalytics: null,
                }));
                setSessionStatusTotals(mapSessionStatusTotals(null));
            } finally {
                markSectionComplete(["sessions", "sessionAnalytics"]);
            }
        })());

        tasks.push((async () => {
            try {
                const response = await fetch(`/api/analytics/organization-reach?organizationId=${organizationId}`, {
                    method: "GET",
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch organization reach");
                }
                const payload: {
                    totalViews?: number;
                    uniqueUsers?: number;
                    viewsTimeSeries?: TimeSeriesData[];
                    deviceBreakdown?: DeviceBreakdown[];
                    trafficSources?: TrafficSource[];
                } = await response.json();
                setData(prev => ({
                    ...prev,
                    audience: {
                        totalViews: typeof payload.totalViews === "number" ? payload.totalViews : 0,
                        uniqueUsers: typeof payload.uniqueUsers === "number" ? payload.uniqueUsers : 0,
                        viewsTimeSeries: payload.viewsTimeSeries ?? [],
                        deviceBreakdown: payload.deviceBreakdown ?? [],
                        trafficSources: payload.trafficSources ?? [],
                    },
                }));
            } catch (audienceError) {
                console.error("Failed to fetch organization reach", audienceError);
                setError(prev => prev ?? "Audience insights failed to load.");
                setData(prev => ({...prev, audience: createEmptyAudience()}));
            } finally {
                markSectionComplete("audience");
            }
        })());

        tasks.push((async () => {
            try {
                const approvedResponse = await getMyOrganizationEvents(
                    organizationId,
                    EventStatus.APPROVED,
                    undefined,
                    0,
                    highlightedEventCount,
                );
                setHighlightedEvents(approvedResponse.content.slice(0, highlightedEventCount));
            } catch (highlightedError) {
                console.error("Failed to fetch approved events", highlightedError);
                setError(prev => prev ?? "Highlighted events failed to load.");
                setHighlightedEvents([]);
            } finally {
                markSectionComplete("highlightedEvents");
            }
        })());

        await Promise.allSettled(tasks);
    }, [fetchEventsAcrossPages, highlightedEventCount, highlightedSessionCount, markSectionComplete, organizationId]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const isLoading = useMemo(() => Object.values(loadingState).some(Boolean), [loadingState]);

    return {
        data,
        loading: loadingState,
        isLoading,
        error,
        highlightedEvents,
        sessionStatusTotals,
        refetch: loadDashboard,
    };
};

"use client";

import {useCallback, useEffect, useState} from "react";
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
}

interface UseOrganizationDashboardDataOptions {
    highlightedEventCount?: number;
    highlightedSessionCount?: number;
}

const DEFAULT_OPTIONS: Required<UseOrganizationDashboardDataOptions> = {
    highlightedEventCount: 3,
    highlightedSessionCount: 6,
};

const PAGE_SIZE_FOR_EVENTS = 50;

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

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OrganizationDashboardData | null>(null);
    const [highlightedEvents, setHighlightedEvents] = useState<EventSummaryDTO[]>([]);
    const [sessionStatusTotals, setSessionStatusTotals] = useState<Record<SessionStatus, number>>(() => mapSessionStatusTotals(null));

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
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [allEvents, sessionAnalytics, sessionsResponse] = await Promise.all([
                fetchEventsAcrossPages(),
                getOrganizationSessionAnalytics(organizationId),
                getOrganizationSessions(organizationId, undefined, 0, highlightedSessionCount),
            ]);

            let approvedEvents: EventSummaryDTO[] = [];
            try {
                const approvedResponse = await getMyOrganizationEvents(
                    organizationId,
                    EventStatus.APPROVED,
                    undefined,
                    0,
                    highlightedEventCount
                );
                approvedEvents = approvedResponse.content.slice(0, highlightedEventCount);
            } catch (err) {
                console.error("Failed to fetch approved events", err);
            }

            let revenueBatch: EventOrderAnalyticsBatchResponse | null = null;
            if (allEvents.length > 0) {
                const eventIds = allEvents.map(event => event.id);
                try {
                    revenueBatch = await getEventOrderAnalyticsBatch(eventIds);
                } catch (err) {
                    console.error("Failed to fetch revenue analytics batch", err);
                }
            }

            setHighlightedEvents(approvedEvents);

            const dailySales = uniqueDailySales(revenueBatch);
            const totalRevenue = revenueBatch?.total_revenue ?? 0;
            const totalBeforeDiscounts = revenueBatch?.total_before_discounts ?? totalRevenue;
            const totalDiscounts = Math.max(totalBeforeDiscounts - totalRevenue, 0);

            setSessionStatusTotals(mapSessionStatusTotals(sessionAnalytics));

            setData({
                events: allEvents
                    .slice()
                    .sort((a, b) => new Date(a.earliestSessionDate).getTime() - new Date(b.earliestSessionDate).getTime()),
                sessions: sessionsResponse.content,
                sessionAnalytics,
                revenue: {
                    totalRevenue,
                    totalBeforeDiscounts,
                    totalDiscounts,
                    dailySales,
                },
            });
        } catch (err) {
            console.error("Failed to load organization dashboard", err);
            setError("We couldn't load the dashboard data. Please try again shortly.");
        } finally {
            setIsLoading(false);
        }
    }, [organizationId, fetchEventsAcrossPages, highlightedSessionCount, highlightedEventCount]);

    useEffect(() => {
        if (!organizationId) {
            setData(null);
            setError("Missing organization identifier");
            setIsLoading(false);
            setHighlightedEvents([]);
            return;
        }

        void loadDashboard();
    }, [organizationId, loadDashboard]);

    return {
        data,
        isLoading,
        error,
    highlightedEvents,
        sessionStatusTotals,
        refetch: loadDashboard,
    };
};

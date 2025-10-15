"use client";

import {useCallback, useEffect, useState} from "react";
import {getAllEvents_Admin, getAnyEventById_Admin} from "@/lib/actions/eventActions";
import {EventStatus, EventSummaryDTO} from "@/lib/validators/event";
import {DeviceBreakdown, TimeSeriesData, TopEventViews, TrafficSource} from "@/types/eventAnalytics";

interface PlatformOverviewData {
    totalViews: number;
    uniqueUsers: number;
    viewsTimeSeries: TimeSeriesData[];
    deviceBreakdown: DeviceBreakdown[];
    trafficSources: TrafficSource[];
}

interface TopEventDetail extends TopEventViews {
    title?: string;
    organizationName?: string;
}

interface AdminDashboardData {
    overview: PlatformOverviewData;
    totals: {
        totalEvents: number;
        pendingEvents: number;
        approvedEvents: number;
        rejectedEvents: number;
    };
    topEvents: TopEventDetail[];
    pendingApprovals: EventSummaryDTO[];
}

type LoadingKey = "overview" | "totals" | "pending";

type LoadingState = Record<LoadingKey, boolean>;

const EMPTY_OVERVIEW: PlatformOverviewData = {
    totalViews: 0,
    uniqueUsers: 0,
    viewsTimeSeries: [],
    deviceBreakdown: [],
    trafficSources: [],
};

const INITIAL_DATA: AdminDashboardData = {
    overview: EMPTY_OVERVIEW,
    totals: {
        totalEvents: 0,
        pendingEvents: 0,
        approvedEvents: 0,
        rejectedEvents: 0,
    },
    topEvents: [],
    pendingApprovals: [],
};

const INITIAL_LOADING_STATE: LoadingState = {
    overview: true,
    totals: true,
    pending: true,
};

export const useAdminDashboardData = () => {
    const [data, setData] = useState<AdminDashboardData>(INITIAL_DATA);
    const [loadingState, setLoadingState] = useState<LoadingState>(INITIAL_LOADING_STATE);
    const [error, setError] = useState<string | null>(null);

    const markSectionComplete = useCallback((section: LoadingKey | LoadingKey[]) => {
        setLoadingState(prev => {
            const sections = Array.isArray(section) ? section : [section];
            return sections.reduce<LoadingState>((acc, key) => {
                acc[key] = false;
                return acc;
            }, {...prev});
        });
    }, []);

    const loadDashboard = useCallback(async () => {
        setError(null);
        setLoadingState(INITIAL_LOADING_STATE);

        const tasks: Promise<void>[] = [];

        tasks.push((async () => {
            try {
                const {getPlatformAudienceInsights} = await import("@/lib/actions/public/server/eventActions");
                const result = await getPlatformAudienceInsights();
                const platformData = result.data;

                if (!result.success || !platformData) {
                    throw new Error(result.error ?? "Failed to load platform insights");
                }

                const isValidUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

                const topEvents = platformData.topEvents ?? [];
                const enrichedTopEvents: TopEventDetail[] = await Promise.all(topEvents.map(async (item) => {
                    if (!item.eventId || item.eventId === "unknown" || !isValidUuid(item.eventId)) {
                        return {
                            ...item,
                            eventId: item.eventId ?? "unknown",
                        };
                    }

                    try {
                        const event = await getAnyEventById_Admin(item.eventId);
                        return {
                            ...item,
                            title: event.title,
                            organizationName: event.organizationName,
                        };
                    } catch (fetchError) {
                        console.warn("Skipping top event that could not be loaded", {
                            eventId: item.eventId,
                            error: fetchError,
                        });
                        return {
                            ...item,
                            eventId: item.eventId,
                        };
                    }
                }));

                setData(prev => ({
                    ...prev,
                    overview: {
                        totalViews: platformData.totalViews,
                        uniqueUsers: platformData.uniqueUsers,
                        viewsTimeSeries: platformData.viewsTimeSeries,
                        deviceBreakdown: platformData.deviceBreakdown,
                        trafficSources: platformData.trafficSources,
                    },
                    topEvents: enrichedTopEvents,
                }));
            } catch (overviewError) {
                console.error("Failed to fetch platform overview", overviewError);
                setError(prev => prev ?? "Platform analytics failed to load.");
                setData(prev => ({
                    ...prev,
                    overview: EMPTY_OVERVIEW,
                    topEvents: [],
                }));
            } finally {
                markSectionComplete("overview");
            }
        })());

        tasks.push((async () => {
            try {
                const [allEvents, pendingEvents, approvedEvents, rejectedEvents] = await Promise.all([
                    getAllEvents_Admin(undefined, undefined, 0, 1),
                    getAllEvents_Admin(EventStatus.PENDING, undefined, 0, 1),
                    getAllEvents_Admin(EventStatus.APPROVED, undefined, 0, 1),
                    getAllEvents_Admin(EventStatus.REJECTED, undefined, 0, 1),
                ]);

                setData(prev => ({
                    ...prev,
                    totals: {
                        totalEvents: allEvents.totalElements ?? 0,
                        pendingEvents: pendingEvents.totalElements ?? 0,
                        approvedEvents: approvedEvents.totalElements ?? 0,
                        rejectedEvents: rejectedEvents.totalElements ?? 0,
                    },
                }));
            } catch (totalsError) {
                console.error("Failed to fetch event totals", totalsError);
                setError(prev => prev ?? "Event metrics failed to load.");
                setData(prev => ({
                    ...prev,
                    totals: INITIAL_DATA.totals,
                }));
            } finally {
                markSectionComplete("totals");
            }
        })());

        tasks.push((async () => {
            try {
                const pending = await getAllEvents_Admin(EventStatus.PENDING, undefined, 0, 5);
                setData(prev => ({
                    ...prev,
                    pendingApprovals: pending.content ?? [],
                }));
            } catch (pendingError) {
                console.error("Failed to fetch pending approvals", pendingError);
                setError(prev => prev ?? "Pending approvals failed to load.");
                setData(prev => ({
                    ...prev,
                    pendingApprovals: [],
                }));
            } finally {
                markSectionComplete("pending");
            }
        })());

        await Promise.all(tasks);
    }, [markSectionComplete]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    return {
        data,
        loading: loadingState,
        error,
        refetch: loadDashboard,
    };
};

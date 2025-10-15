'use server';

import {EventBasicInfoDTO, SessionInfoBasicDTO} from "@/types/event";
import {BetaAnalyticsDataClient} from '@google-analytics/data';
import {AudienceGeo, DeviceBreakdown, GaInsights, TimeSeriesData, TopEventViews, TrafficSource} from "@/types/eventAnalytics";
import {google} from "@google-analytics/data/build/protos/protos";
import RunReportRequest = google.analytics.data.v1beta.RunReportRequest;

// Create a type that satisfies TypeScript for our GA requests
type GaRunReportRequest = Partial<RunReportRequest> & {
    property: string;
    dateRanges: {
        startDate: string;
        endDate: string;
    }[];
    dimensions: {
        name: string;
    }[];
    metrics: {
        name: string;
    }[];
};

const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1`;

export async function getEventSummery(eventId: string): Promise<EventBasicInfoDTO> {
    const res = await fetch(`${API_BASE_PATH}/events/${eventId}/basic-info`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });
    if (!res.ok) {
        throw new Error("Failed to fetch event");
    }
    return await res.json();
}

export async function getSessionSummery(sessionId: string): Promise<SessionInfoBasicDTO> {
    const res = await fetch(`${API_BASE_PATH}/sessions/${sessionId}/basic-info`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });
    if (!res.ok) {
        throw new Error("Failed to fetch session");
    }
    return await res.json();
}

// Helper function to initialize the client and check for env vars
const initializeAnalyticsClient = () => {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GA_PROPERTY_ID) {
        throw new Error("Google Analytics environment variables are not set.");
    }
    return new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
    });
};

const propertyId = `properties/${process.env.GA_PROPERTY_ID}`;

const normalizeDeviceCategory = (value?: string | null): DeviceBreakdown['device'] => {
    switch ((value ?? "").toLowerCase()) {
    case "desktop":
        return "Desktop";
    case "mobile":
        return "Mobile";
    case "tablet":
        return "Tablet";
    default:
        return "Unknown";
    }
};

/**
 * Fetches the total event view count for a specific event ID.
 */
export async function getEventTotalViews(eventId: string): Promise<{
    success: boolean;
    viewCount?: number;
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();
        const [response] = await analyticsClient.runReport({
            property: propertyId,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'customEvent:event_id'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}},
            },
        });
        const viewCount = response.rows?.[0]?.metricValues?.[0]?.value || '0';
        return {success: true, viewCount: parseInt(viewCount, 10)};
    } catch (error) {
        console.error("Error fetching GA total views:", error);
        return {success: false, error: "Failed to fetch total views."};
    }
}

/**
 * Fetches a time-series of event page views for the last 30 days.
 */
export async function getEventViewsTimeSeries(eventId: string): Promise<{
    success: boolean;
    data?: TimeSeriesData[];
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();
        const [response] = await analyticsClient.runReport({
            property: propertyId,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'date'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}},
            },
            orderBys: [{dimension: {orderType: 'ALPHANUMERIC', dimensionName: 'date'}}]
        });
        const data = response.rows?.map(row => ({
            date: row.dimensionValues?.[0].value || 'Unknown Date',
            views: parseInt(row.metricValues?.[0].value || '0', 10)
        })) || [];
        return {success: true, data};
    } catch (error) {
        console.error("Error fetching GA time-series data:", error);
        return {success: false, error: "Failed to fetch time-series data."};
    }
}

/**
 * Fetches the top traffic sources for the event page.
 */
export async function getEventTrafficSources(eventId: string): Promise<{
    success: boolean;
    data?: TrafficSource[];
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();
        const [response] = await analyticsClient.runReport({
            property: propertyId,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'sessionSource'}, {name: 'sessionMedium'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}},
            },
            orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
            limit: 5
        });
        const data = response.rows?.map(row => ({
            source: row.dimensionValues?.[0].value || 'Unknown',
            medium: row.dimensionValues?.[1].value || 'Unknown',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];
        return {success: true, data};
    } catch (error) {
        console.error("Error fetching GA traffic sources:", error);
        return {success: false, error: "Failed to fetch traffic sources."};
    }
}

/**
 * Fetches the top audience geographic locations (countries).
 */
export async function getEventAudienceGeography(eventId: string): Promise<{
    success: boolean;
    data?: AudienceGeo[];
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();
        const [response] = await analyticsClient.runReport({
            property: propertyId,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'city'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}},
            },
            orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
            limit: 5
        });
        const data = response.rows?.map(row => ({
            location: row.dimensionValues?.[0].value || 'Unknown',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];
        return {success: true, data};
    } catch (error) {
        console.error("Error fetching GA geography:", error);
        return {success: false, error: "Failed to fetch geography data."};
    }
}

/**
 * Fetches the breakdown of views by device category.
 */
export async function getEventDeviceBreakdown(eventId: string): Promise<{
    success: boolean;
    data?: DeviceBreakdown[];
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();
        const [response] = await analyticsClient.runReport({
            property: propertyId,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'deviceCategory'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}},
            },
        });
        const data = response.rows?.map(row => ({
            device: normalizeDeviceCategory(row.dimensionValues?.[0].value),
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];
        return {success: true, data};
    } catch (error) {
        console.error("Error fetching GA device data:", error);
        return {success: false, error: "Failed to fetch device data."};
    }
}

export async function getPlatformAudienceInsights(): Promise<{
    success: boolean;
    data?: {
        totalViews: number;
        uniqueUsers: number;
        viewsTimeSeries: TimeSeriesData[];
        deviceBreakdown: DeviceBreakdown[];
        trafficSources: TrafficSource[];
        topEvents: TopEventViews[];
    };
    error?: string;
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();

        const dateRange = {startDate: '30daysAgo', endDate: 'today'};

        const requests: GaRunReportRequest[] = [
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [],
                metrics: [{name: 'eventCount'}, {name: 'totalUsers'}],
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'date'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{dimension: {orderType: 'ALPHANUMERIC', dimensionName: 'date'}}],
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'deviceCategory'}],
                metrics: [{name: 'eventCount'}],
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'sessionSource'}, {name: 'sessionMedium'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
                limit: 5,
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'customEvent:event_id'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
                limit: 5,
            }
        ];

        const [batchResponse] = await analyticsClient.batchRunReports({
            property: propertyId,
            requests,
        });

        const totalsReport = batchResponse.reports?.[0];
        const timeSeriesReport = batchResponse.reports?.[1];
        const deviceReport = batchResponse.reports?.[2];
        const trafficSourcesReport = batchResponse.reports?.[3];
        const topEventsReport = batchResponse.reports?.[4];

        const totalViews = parseInt(totalsReport?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        const uniqueUsers = parseInt(totalsReport?.rows?.[0]?.metricValues?.[1]?.value || '0', 10);

        const viewsTimeSeries: TimeSeriesData[] = timeSeriesReport?.rows?.map(row => ({
            date: row.dimensionValues?.[0].value || 'Unknown Date',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        const deviceBreakdown: DeviceBreakdown[] = deviceReport?.rows?.map(row => ({
            device: normalizeDeviceCategory(row.dimensionValues?.[0].value),
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        const trafficSources: TrafficSource[] = trafficSourcesReport?.rows?.map(row => ({
            source: row.dimensionValues?.[0].value || 'Unknown',
            medium: row.dimensionValues?.[1].value || 'Unknown',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        const topEvents: TopEventViews[] = topEventsReport?.rows?.map(row => ({
            eventId: row.dimensionValues?.[0].value || 'unknown',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        return {
            success: true,
            data: {
                totalViews,
                uniqueUsers,
                viewsTimeSeries,
                deviceBreakdown,
                trafficSources,
                topEvents,
            }
        };
    } catch (error) {
        console.error("Error fetching GA platform insights:", error);
        return {success: false, error: "Failed to fetch platform audience insights."};
    }
}

/**
 * Fetches aggregated audience insights for an organization including total views,
 * unique users (reach), daily view time series, and device breakdown.
 */
export async function getOrganizationAudienceInsights(organizationId: string): Promise<{
    success: boolean;
    data?: {
        totalViews: number;
        uniqueUsers: number;
        viewsTimeSeries: TimeSeriesData[];
        deviceBreakdown: DeviceBreakdown[];
        trafficSources: TrafficSource[];
    };
    error?: string;
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();

        const dateRange = {startDate: '30daysAgo', endDate: 'today'};

        const requests: GaRunReportRequest[] = [
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'customEvent:organization_id'}],
                metrics: [{name: 'eventCount'}, {name: 'totalUsers'}],
                dimensionFilter: {
                    filter: {
                        fieldName: 'customEvent:organization_id',
                        stringFilter: {value: organizationId, matchType: 'EXACT'}
                    }
                },
                limit: 1,
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'date'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{dimension: {orderType: 'ALPHANUMERIC', dimensionName: 'date'}}],
                dimensionFilter: {
                    filter: {
                        fieldName: 'customEvent:organization_id',
                        stringFilter: {value: organizationId, matchType: 'EXACT'}
                    }
                },
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'deviceCategory'}],
                metrics: [{name: 'eventCount'}],
                dimensionFilter: {
                    filter: {
                        fieldName: 'customEvent:organization_id',
                        stringFilter: {value: organizationId, matchType: 'EXACT'}
                    }
                },
            },
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'sessionSource'}, {name: 'sessionMedium'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
                limit: 5,
                dimensionFilter: {
                    filter: {
                        fieldName: 'customEvent:organization_id',
                        stringFilter: {value: organizationId, matchType: 'EXACT'}
                    }
                },
            }
        ];

        const [batchResponse] = await analyticsClient.batchRunReports({
            property: propertyId,
            requests,
        });

        const totalsReport = batchResponse.reports?.[0];
        const timeSeriesReport = batchResponse.reports?.[1];
        const deviceReport = batchResponse.reports?.[2];
        const trafficSourcesReport = batchResponse.reports?.[3];

        const totalViews = parseInt(totalsReport?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        const uniqueUsers = parseInt(totalsReport?.rows?.[0]?.metricValues?.[1]?.value || '0', 10);

        const viewsTimeSeries: TimeSeriesData[] = timeSeriesReport?.rows?.map(row => ({
            date: row.dimensionValues?.[0].value || 'Unknown Date',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        const deviceBreakdown: DeviceBreakdown[] = deviceReport?.rows?.map(row => ({
            device: normalizeDeviceCategory(row.dimensionValues?.[0].value),
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        const trafficSources: TrafficSource[] = trafficSourcesReport?.rows?.map(row => ({
            source: row.dimensionValues?.[0].value || 'Unknown',
            medium: row.dimensionValues?.[1].value || 'Unknown',
            views: parseInt(row.metricValues?.[0].value || '0', 10),
        })) || [];

        return {
            success: true,
            data: {
                totalViews,
                uniqueUsers,
                viewsTimeSeries,
                deviceBreakdown,
                trafficSources,
            }
        };
    } catch (error) {
        console.error("Error fetching GA organization audience insights:", error);
        return {success: false, error: "Failed to fetch organization audience insights."};
    }
}

/**
 * Fetches all required Google Analytics insights for an event in a single batch request.
 * @param eventId The ID of the event to fetch analytics for.
 * @returns An object containing all the fetched GA data.
 */
export async function getBatchedGaInsights(eventId: string): Promise<{
    success: boolean;
    data?: GaInsights;
    error?: string
}> {
    try {
        const analyticsClient = initializeAnalyticsClient();

        if (!propertyId) {
            throw new Error("Google Analytics property ID is not defined");
        }

        const dateRange = {startDate: '30daysAgo', endDate: 'today'};

        // Define all the reports we want to run in the batch
        const requests: GaRunReportRequest[] = [
            // 0: Total Views
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'customEvent:event_id'}],
                metrics: [{name: 'eventCount'}],
                dimensionFilter: {
                    filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}}
                },
            },
            // 1: Views Time Series
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'date'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{dimension: {orderType: 'ALPHANUMERIC', dimensionName: 'date'}}],
                dimensionFilter: {
                    filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}}
                },
            },
            // 2: Traffic Sources
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'sessionSource'}, {name: 'sessionMedium'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
                limit: 5,
                dimensionFilter: {
                    filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}}
                },
            },
            // 3: Audience Geography
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'city'}],
                metrics: [{name: 'eventCount'}],
                orderBys: [{metric: {metricName: 'eventCount'}, desc: true}],
                limit: 5,
                dimensionFilter: {
                    filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}}
                },
            },
            // 4: Device Breakdown
            {
                property: propertyId,
                dateRanges: [dateRange],
                dimensions: [{name: 'deviceCategory'}],
                metrics: [{name: 'eventCount'}],
                dimensionFilter: {
                    filter: {fieldName: 'customEvent:event_id', stringFilter: {value: eventId, matchType: 'EXACT'}}
                },
            }
        ];

        // Make the single batch API call
        const [response] = await analyticsClient.batchRunReports({
            property: propertyId,
            requests
        });

        // Parse the batched response, relying on the guaranteed order
        const totalViewsResponse = response.reports?.[0];
        const timeSeriesResponse = response.reports?.[1];
        const trafficSourcesResponse = response.reports?.[2];
        const audienceGeoResponse = response.reports?.[3];
        const deviceBreakdownResponse = response.reports?.[4];

        const data: GaInsights = {
            totalViews: parseInt(totalViewsResponse?.rows?.[0]?.metricValues?.[0]?.value || '0', 10),
            viewsTimeSeries: timeSeriesResponse?.rows?.map(row => ({
                date: row.dimensionValues?.[0].value || 'Unknown Date',
                views: parseInt(row.metricValues?.[0].value || '0', 10)
            })) || [],
            trafficSources: trafficSourcesResponse?.rows?.map(row => ({
                source: row.dimensionValues?.[0].value || 'Unknown',
                medium: row.dimensionValues?.[1].value || 'Unknown',
                views: parseInt(row.metricValues?.[0].value || '0', 10),
            })) || [],
            audienceGeography: audienceGeoResponse?.rows?.map(row => ({
                location: row.dimensionValues?.[0].value || 'Unknown',
                views: parseInt(row.metricValues?.[0].value || '0', 10),
            })) || [],
            deviceBreakdown: deviceBreakdownResponse?.rows?.map(row => ({
                device: row.dimensionValues?.[0].value as DeviceBreakdown['device'] || 'Unknown',
                views: parseInt(row.metricValues?.[0].value || '0', 10),
            })) || []
        };

        return {success: true, data};

    } catch (error) {
        console.error("Error fetching batched GA data:", error);
        return {success: false, error: "Failed to fetch batched analytics data."};
    }
}
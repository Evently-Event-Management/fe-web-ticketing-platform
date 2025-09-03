'use server';

import {EventBasicInfoDTO, SessionInfoBasicDTO} from "@/types/event";
import {BetaAnalyticsDataClient} from '@google-analytics/data';

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


export async function getEventViews(eventId: string) {
    const analyticsClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }
    });
    const propertyId = process.env.GA_PROPERTY_ID;

    try {
        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{startDate: '30daysAgo', endDate: 'today'}],
            dimensions: [{name: 'customEvent:event_id'}],
            metrics: [{name: 'eventCount'}],
            dimensionFilter: {
                filter: {
                    fieldName: 'customEvent:event_id',
                    stringFilter: {value: eventId, matchType: 'EXACT'},
                },
            },
        });

        console.log("response", response);

        // Safely extract the view count from the response.
        const viewCount = response.rows?.[0]?.metricValues?.[0]?.value || '0';

        return {
            success: true,
            viewCount: parseInt(viewCount),
        };
    } catch (error) {
        console.error("Error fetching Google Analytics data:", error);
        return {success: false, error: "Failed to fetch analytics data."};
    }
}
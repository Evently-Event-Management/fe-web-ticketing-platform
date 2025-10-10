import {DiscountDTO, EventThumbnailDTO, SessionInfoBasicDTO} from "@/types/event";
import {PaginatedResponse} from "@/types/paginatedResponse";
import {apiFetch} from "@/lib/api";

const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/events`;
const ANALYTICS_API_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/events`;
const ORDER_API_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/order`;


export async function searchEvents({
                                       searchTerm,
                                       categoryId,
                                       longitude,
                                       latitude,
                                       radiusKm,
                                       dateFrom,
                                       dateTo,
                                       priceMin,
                                       priceMax,
                                       page = 0,
                                       size = 20,
                                       sort = "sessions.startTime,asc"
                                   }: {
    searchTerm?: string;
    categoryId?: string;
    longitude?: number;
    latitude?: number;
    radiusKm?: number;
    dateFrom?: string;
    dateTo?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    size?: number;
    sort?: string;
}): Promise<PaginatedResponse<EventThumbnailDTO>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (categoryId) params.append("categoryId", categoryId);
    if (longitude !== undefined) params.append("longitude", longitude.toString());
    if (latitude !== undefined) params.append("latitude", latitude.toString());
    if (radiusKm !== undefined) params.append("radiusKm", radiusKm.toString());
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (priceMin !== undefined) params.append("priceMin", priceMin.toString());
    if (priceMax !== undefined) params.append("priceMax", priceMax.toString());
    params.append("page", page.toString());
    params.append("size", size.toString());
    params.append("sort", sort);

    const url = `${API_BASE_PATH}/search?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });
    if (!res.ok) {
        throw new Error("Failed to fetch events");
    }
    return await res.json();
}

/**
 * Fetches event sessions for a specific event
 */
export async function getEventSessions({
                                           eventId,
                                           page = 0,
                                           size = 10,
                                           sort = "startTime,asc"
                                       }: {
    eventId: string;
    page?: number;
    size?: number;
    sort?: string;
}): Promise<PaginatedResponse<SessionInfoBasicDTO>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    params.append("sort", sort);

    const url = `${API_BASE_PATH}/${eventId}/sessions?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch event sessions: ${res.status}`);
    }

    return await res.json();
}

export async function getTrendingEvents(limit: number = 10): Promise<EventThumbnailDTO[]> {
    const url = `${ANALYTICS_API_PATH}/trending?limit=${limit}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch trending events: ${res.status}`);
    }

    return await res.json();
}

/**
 * Fetches event sessions for a specific event
 */
export async function getEventSessionsInRange({
                                                  eventId,
                                                  fromDate,
                                                  toDate,
                                              }: {
    eventId: string;
    fromDate: string;
    toDate: string;
}): Promise<SessionInfoBasicDTO[]> {
    const params = new URLSearchParams();
    params.append("fromDate", fromDate);
    params.append("toDate", toDate);

    const url = `${API_BASE_PATH}/${eventId}/sessions/sessions-in-range?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch event sessions in range: ${res.status}`);
    }

    return await res.json();
}

export async function getPublicDiscounts(eventId: string, sessionId: string): Promise<DiscountDTO[]> {
    const url = `${API_BASE_PATH}/${eventId}/sessions/${sessionId}/discounts/public`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch public discounts: ${res.status}`);
    }

    return await res.json();
}

export const getDiscountByCode = (eventId: string, sessionId: string, code: string): Promise<DiscountDTO | null> => {
    const url = `/event-query/v1/events/${eventId}/sessions/${sessionId}/discounts/code/${code}`;
    return apiFetch<DiscountDTO | null>(url, {
        method: 'GET',
    });
};

export async function getTotalSessionsCount(): Promise<number> {
    const url = `${API_BASE_PATH}/sessions/count`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch total sessions count: ${res.status}`);
    }

    const data = await res.json();
    return data.totalSessions;
}

/**
 * Gets the total count of tickets sold
 *
 * @returns Promise with the total count of tickets sold
 */
export const getTotalTicketsSold = async (): Promise<number> => {
    const url = `${ORDER_API_PATH}/tickets/count`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch total tickets sold count: ${response.status}`);
    }
    return (await response.json()).total_count;
}


export type EventSearchResult = Awaited<ReturnType<typeof searchEvents>>;
export type EventSessionsResult = Awaited<ReturnType<typeof getEventSessions>>;

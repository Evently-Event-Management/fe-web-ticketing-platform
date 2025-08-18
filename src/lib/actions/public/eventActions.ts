import {EventThumbnailDTO} from "@/types/event";
import {PaginatedResponse} from "@/types/paginatedResponse";

const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/events`;

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


export type EventSearchResult = Awaited<ReturnType<typeof searchEvents>>;
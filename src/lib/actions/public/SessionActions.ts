import {SessionSeatingMapDTO} from "@/types/event";

const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/sessions`;


export async function getSessionSeatingMap(sessionId: string): Promise<SessionSeatingMapDTO> {
    const url = `${API_BASE_PATH}/${sessionId}/seating-map`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });
    if (!res.ok) {
        throw new Error("Failed to fetch session seating map");
    }
    return await res.json();
}
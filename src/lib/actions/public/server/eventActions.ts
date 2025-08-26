'use server';

import {EventBasicInfoDTO, SessionInfoBasicDTO} from "@/types/event";

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
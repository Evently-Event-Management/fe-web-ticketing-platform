'use server';

import {EventBasicInfoDTO} from "@/types/event";

const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/events`;

export async function eventServerActions(eventId: string): Promise<EventBasicInfoDTO> {
    const res = await fetch(`${API_BASE_PATH}/${eventId}/basic-info`, {
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
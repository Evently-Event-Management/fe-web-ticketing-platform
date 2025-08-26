const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/sse`


/**
 * Subscribes to seat status updates for a session using SSE.
 * Returns the EventSource instance so the caller can attach listeners.
 * @param sessionId The session ID
 */
export function subscribeToSeatStatusUpdates(sessionId: string): EventSource {
    const url = `${API_BASE_PATH}/sessions/${sessionId}/seat-status`;
    return new EventSource(url);
}
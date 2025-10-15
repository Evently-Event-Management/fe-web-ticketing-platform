// lib/api.ts
import keycloak from './keycloak'; // Your Keycloak instance

// Custom API Error class
export class ApiError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        
        // This is needed for proper instanceof checks with custom Error classes
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

// Define a generic type for our fetch function
type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

interface ApiSseMessage<T> {
    event?: string;
    data?: T;
    raw: string;
}

interface ApiSseOptions<T> {
    onMessage: (message: ApiSseMessage<T>) => void;
    onError?: (error: Error) => void;
    parse?: (raw: string) => T;
    signal?: AbortSignal;
}

/**
 * A centralized fetcher function that automatically handles Keycloak token refresh and attachment.
 * @param endpoint - The API endpoint to call (e.g., '/v1/organizations')
 * @param options - Standard fetch options (method, body, etc.)
 * @returns The parsed JSON response
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
    if (!keycloak) {
        throw new Error('Keycloak is not initialized. Cannot make API calls.');
    }

    if (!keycloak.authenticated) {
        throw new Error('User is not authenticated');
    }

    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error('Token refresh failed:', error);
        await keycloak.login();
        throw new Error('Token refresh failed, redirecting to login.');
    }

    const headers: Record<string, string> = {
        ...options.headers,
    };

    // Only set Content-Type for non-form-data requests
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = `Bearer ${keycloak.token}`;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088/api';
    const response = await fetch(`${baseUrl}${endpoint}`, {...options, headers});

    if (!response.ok) {
        // ✅ Enhanced error handling logic with custom ApiError
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            // Try to parse the error response as JSON
            const errorBody = await response.json();
            // If successful, use the specific message from the backend, otherwise keep the default
            errorMessage = errorBody.message || errorMessage;
        } catch {
            // The error response wasn't valid JSON. The default message is sufficient.
            console.warn("Could not parse error response as JSON.");
        }
        // Throw our custom ApiError with the status code
        throw new ApiError(errorMessage, response.status);
    }

    // Handle empty responses or 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
    }

    // Check if there's actual content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        // Only parse as JSON if there's actual content
        return text ? JSON.parse(text) as T : null as T;
    }

    // If not JSON content-type, return null
    return null as T;
}

const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;

const parseSseChunk = <T,>(chunk: string, parse?: (raw: string) => T): ApiSseMessage<T> | undefined => {
    const dataLines: string[] = [];
    let eventName: string | undefined;
    const lines = chunk.split("\n");

    for (const line of lines) {
        if (line.startsWith(":")) {
            continue; // comment
        }
        if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
            continue;
        }
        if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
        }
    }

    if (dataLines.length === 0) {
        return eventName ? {event: eventName, raw: ""} : undefined;
    }

    const rawPayload = dataLines.join("\n");
    let parsed: T | undefined;

    if (parse) {
        parsed = parse(rawPayload);
    } else {
        try {
            parsed = JSON.parse(rawPayload) as T;
        } catch (error) {
            console.warn("Failed to parse SSE payload", error);
        }
    }

    return {
        event: eventName,
        data: parsed,
        raw: rawPayload,
    };
};

export const subscribeToSse = <T,>(endpoint: string, options: ApiSseOptions<T>): (() => void) => {
    if (!textDecoder) {
        throw new Error("Streaming not supported in this environment");
    }

    const controller = new AbortController();
    const externalSignal = options.signal;

    const mergeSignal = () => {
        if (!externalSignal) {
            return controller.signal;
        }

        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", () => controller.abort(), {once: true});
        }

        return controller.signal;
    };

    const signal = mergeSignal();

    void (async () => {
        try {
            if (!keycloak) {
                throw new Error('Keycloak is not initialized. Cannot make API calls.');
            }

            if (!keycloak.authenticated) {
                throw new Error('User is not authenticated');
            }

            try {
                await keycloak.updateToken(30);
            } catch (error) {
                console.error('Token refresh failed:', error);
                await keycloak.login();
                throw new Error('Token refresh failed, redirecting to login.');
            }

            const headers: Record<string, string> = {
                Accept: 'text/event-stream',
                Authorization: `Bearer ${keycloak.token}`,
            };

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088/api';
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'GET',
                headers,
                signal,
            });

            if (!response.ok) {
                throw new ApiError(`SSE connection failed with status ${response.status}`, response.status);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('SSE response does not contain a readable stream.');
            }

            let buffer = '';

            while (!signal.aborted) {
                const {value, done} = await reader.read();
                if (done) {
                    break;
                }

                buffer += textDecoder.decode(value, {stream: true});

                let boundary = buffer.indexOf('\n\n');
                while (boundary !== -1) {
                    const chunk = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);

                    const payload = parseSseChunk<T>(chunk, options.parse);
                    if (payload) {
                        options.onMessage(payload);
                    }

                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch (error) {
            if (!signal.aborted) {
                options.onError?.(error instanceof Error ? error : new Error(String(error)));
            }
        } finally {
            if (!signal.aborted) {
                controller.abort();
            }
        }
    })();

    return () => {
        if (!controller.signal.aborted) {
            controller.abort();
        }
    };
};

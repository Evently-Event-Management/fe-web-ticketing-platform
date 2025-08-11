// lib/api.ts
import keycloak from './keycloak'; // Your Keycloak instance

// Define a generic type for our fetch function
type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

/**
 * A centralized fetcher function that automatically handles Keycloak token refresh and attachment.
 * @param endpoint - The API endpoint to call (e.g., '/v1/organizations')
 * @param options - Standard fetch options (method, body, etc.)
 * @returns The parsed JSON response
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
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
        // ✅ Corrected error handling logic
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            // Try to parse the error response as JSON
            const errorBody = await response.json();
            // If successful, use the specific message from the backend, otherwise keep the default
            errorMessage = errorBody.message || errorMessage;
        } catch (jsonError) {
            // The error response wasn't valid JSON. The default message is sufficient.
            console.warn("Could not parse error response as JSON.");
        }
        // Throw the final, most specific error message.
        throw new Error(errorMessage);
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

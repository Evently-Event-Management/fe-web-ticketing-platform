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
        // Silently update the token if it's about to expire (e.g., within 30 seconds)
        // This is the "built-in" Keycloak JS way to manage tokens for API calls.
        await keycloak.updateToken(30);
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Force a login if the refresh fails (e.g., session expired)
        await keycloak.login();
        // This throw will likely not be reached, but it's good practice
        throw new Error('Token refresh failed, redirecting to login.');
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keycloak.token}`,
        ...options.headers,
    };

    // Configure this in your .env.local file
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api';
    const response = await fetch(`${baseUrl}${endpoint}`, {...options, headers});

    if (!response.ok) {
        // You can add more specific error handling here based on status codes
        const errorBody = await response.text();
        console.error(`API Error ${response.status}: ${errorBody}`);
        throw new Error(`Request failed with status ${response.status}`);
    }

    // Handle successful responses with no content (e.g., 204 from a DELETE)
    if (response.status === 204) {
        return null as T;
    }

    return await response.json() as T;
}

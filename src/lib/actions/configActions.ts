import { apiFetch } from '@/lib/api';
import { AppConfig, MyLimitsResponse } from '@/types/config';

const API_BASE_PATH = '/event-seating/v1/config';

/**
 * Fetches the complete application configuration.
 * This is a public endpoint and should be called once on app load.
 */
export const getAppConfiguration = (): Promise<AppConfig> => {
    return apiFetch<AppConfig>(API_BASE_PATH);
};

/**
 * Fetches the limits and configuration relevant to the currently authenticated user.
 * This is an authenticated endpoint.
 */
export const getMyLimits = (): Promise<MyLimitsResponse> => {
    return apiFetch<MyLimitsResponse>(`${API_BASE_PATH}/my-limits`);
};

import {apiFetch} from '@/lib/api';
import {GenerateOverviewRequest, GenerateOverviewResponse} from "@/types/ai";


const API_BASE_PATH = '/event-seating/v1/ai';


/**
 * Creates a new event.
 */
export const getOverview = (request: GenerateOverviewRequest): Promise<GenerateOverviewResponse> => {
    return apiFetch<GenerateOverviewResponse>(API_BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(request),
    });
};
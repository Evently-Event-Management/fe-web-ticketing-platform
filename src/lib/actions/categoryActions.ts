import { apiFetch } from '@/lib/api';
import { CategoryResponse } from '@/types/category';

const API_BASE_PATH = '/event-seating/v1/categories';

/**
 * Fetches all categories, including their sub-categories.
 * @returns A promise that resolves to an array of parent categories.
 */
export const getAllCategories = (): Promise<CategoryResponse[]> => {
    return apiFetch<CategoryResponse[]>(API_BASE_PATH);
};

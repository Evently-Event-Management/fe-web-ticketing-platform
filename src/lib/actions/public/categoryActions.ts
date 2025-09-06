import {CategoryResponseWithParentName} from "@/types/category";


const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/categories`;

// Fetch all categories from the public endpoint
export async function fetchAllCategories(): Promise<CategoryResponseWithParentName[]> {
    try {
        const res = await fetch(API_BASE_PATH, {
            method: "GET",
            // Add a timeout to prevent hanging during builds
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn("Failed to fetch categories, using empty array as fallback");
            return [];
        }

        return await res.json();
    } catch (error) {
        // Log the error but return an empty array to prevent build failures
        console.warn("Error fetching categories:", error);
        return [];
    }
}

export async function fetchParentCategories(): Promise<CategoryResponseWithParentName[]> {
    try {
        const res = await fetch(`${API_BASE_PATH}/parents`, {
            method: "GET",
            // Add a timeout to prevent hanging during builds
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn("Failed to fetch parent categories, using empty array as fallback");
            return [];
        }

        return await res.json();
    } catch (error) {
        // Log the error but return an empty array to prevent build failures
        console.warn("Error fetching parent categories:", error);
        return [];
    }
}
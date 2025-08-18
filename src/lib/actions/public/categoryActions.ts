import {CategoryResponseWithParentName} from "@/types/category";


const API_BASE_PATH = `${process.env.NEXT_PUBLIC_API_BASE_URL}/event-query/v1/categories`;

// Fetch all categories from the public endpoint
export async function fetchAllCategories(): Promise<CategoryResponseWithParentName[]> {
    const res = await fetch(API_BASE_PATH, {method: "GET"});
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json()
}

export async function fetchParentCategories(): Promise<CategoryResponseWithParentName[]> {
    const res = await fetch(`${API_BASE_PATH}/parents`, {method: "GET"});
    if (!res.ok) throw new Error("Failed to fetch parent categories");
    return await res.json();
}
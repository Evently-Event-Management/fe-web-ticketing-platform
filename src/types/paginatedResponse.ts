// ✅ New generic type for Spring Boot's Page object
export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number; // The current page number
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
// types/category.ts

export interface CategoryResponse {
    id: string;
    name: string;
    parentId?: string;
    subCategories: CategoryResponse[];
}

export interface CategoryResponseWithParentName {
    id: string;
    name: string;
    parentId?: string;
    parentName?: string; // Name of the parent category
}
// types/category.ts

export interface CategoryResponse {
    id: string;
    name: string;
    parentId?: string;
    subCategories: CategoryResponse[];
}

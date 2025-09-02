'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {CategoryResponseWithParentName} from '@/types/category'; // Adjust this import path
import {cn} from '@/lib/utils';
import {Tag} from 'lucide-react';
import {CATEGORY_CONFIG} from "@/app/(home-app)/_components/CategorySection";

interface CategoryFilterBarProps {
    categories: CategoryResponseWithParentName[];
}

export function CategoryFilterBar({categories}: CategoryFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedCategoryId = searchParams.get('categoryId');

    const handleSelectCategory = (categoryId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId) {
            params.set('categoryId', categoryId);
        } else {
            params.delete('categoryId');
        }
        params.delete('page'); // Reset pagination on filter change
        router.push(`${pathname}?${params.toString()}`);
    };

    // Separate parent and sub-categories
    const parentCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId);

    return (
        <div className="w-full pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {/* "All" button */}
                <Button
                    variant={!selectedCategoryId ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleSelectCategory(null)}
                >
                    All Categories
                </Button>

                {/* Parent Categories with Icons */}
                {parentCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const config = CATEGORY_CONFIG[cat.name] || {icon: Tag, color: 'text-primary'};
                    const Icon = config.icon;

                    return (
                        <Button
                            key={cat.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleSelectCategory(cat.id)}
                        >
                            <Icon className={cn("mr-2 h-4 w-4", !isSelected && config.color)}/>
                            {cat.name}
                        </Button>
                    );
                })}

                {/* Sub-Categories */}
                {subCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                        <Button
                            key={cat.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleSelectCategory(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
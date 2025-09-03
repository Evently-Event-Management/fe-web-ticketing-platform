'use client';

import React, {useRef, useState, useEffect, useCallback} from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {CategoryResponseWithParentName} from '@/types/category'; // Adjust this import path
import {cn} from '@/lib/utils';
import {Tag, ChevronLeft, ChevronRight} from 'lucide-react';
import {CATEGORY_CONFIG} from "@/app/(home-app)/_components/CategorySection";

interface CategoryFilterBarProps {
    categories: CategoryResponseWithParentName[];
}

export function CategoryFilterBar({categories}: CategoryFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [showLeftChevron, setShowLeftChevron] = useState(false);
    const [showRightChevron, setShowRightChevron] = useState(false);

    const selectedCategoryId = searchParams.get('categoryId');

    // Memoize the check for scroll visibility to prevent unnecessary re-renders
    const checkScrollVisibility = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            setShowLeftChevron(el.scrollLeft > 0);
            // Use a 1px buffer for better accuracy across browsers
            setShowRightChevron(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        }
    }, []);

    // Effect to handle scroll and resize events
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        // Check visibility on mount and when categories change
        checkScrollVisibility();

        el.addEventListener('scroll', checkScrollVisibility);

        // Use ResizeObserver to handle window resizing
        const resizeObserver = new ResizeObserver(checkScrollVisibility);
        resizeObserver.observe(el);

        // Cleanup function
        return () => {
            el.removeEventListener('scroll', checkScrollVisibility);
            resizeObserver.disconnect();
        };
    }, [categories, checkScrollVisibility]);

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

    const handleScroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -el.clientWidth / 2 : el.clientWidth / 2;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // Separate parent and sub-categories
    const parentCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId);

    return (
        <div className="relative w-full">
            {/* Left Chevron and Gradient */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 z-10 flex items-center pr-10 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
                showLeftChevron ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={() => handleScroll('left')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={scrollContainerRef}
                className="w-full flex items-center gap-2 overflow-x-auto scrollbar-hide"
            >
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

            {/* Right Chevron and Gradient */}
            <div className={cn(
                "absolute right-0 top-0 bottom-0 z-10 flex items-center pl-10 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
                showRightChevron ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={() => handleScroll('right')}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

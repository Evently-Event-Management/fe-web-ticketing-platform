'use client';

import {CategoryResponseWithParentName} from "@/types/category";
import React, {useEffect, useState} from "react";
import {fetchParentCategories} from "@/lib/actions/public/categoryActions";
import {
    BookOpen,
    Music,
    Brush, // Using Brush for 'Arts & Theatre'
    Utensils,
    Dumbbell,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Enhanced CATEGORY_CONFIG with modern color scheme ---
// Using primary and chart colors from the theme for consistency
export const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    "Workshops & Education": {icon: BookOpen, color: "text-primary"},
    "Music": {icon: Music, color: "text-chart-2"},
    "Arts & Theatre": {icon: Brush, color: "text-chart-3"},
    "Performing & Visual Arts": {icon: Brush, color: "text-chart-3"},
    "Food & Drink": {icon: Utensils, color: "text-chart-1"},
    "Sports & Fitness": {icon: Dumbbell, color: "text-chart-2"},
    "Community & Social": {icon: Users, color: "text-chart-1"},
};

// We're not using this skeleton component anymore as we've embedded it directly in the component
// keeping the definition for backwards compatibility
const CategorySkeleton = () => (
    <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <div className="w-24 h-24 bg-muted/40 backdrop-blur-sm rounded-2xl border border-border/20"></div>
        <div className="h-4 w-20 bg-muted/60 rounded-full"></div>
    </div>
);

export default function CategorySection() {
    const [categories, setCategories] = useState<CategoryResponseWithParentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Simulate network delay to see skeleton
                // await new Promise(resolve => setTimeout(resolve, 1500));
                const data = await fetchParentCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Failed to load categories. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories().then();
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/events?categoryId=${categoryId}`);
    };

    if (isLoading) {
        return (
            <section className="py-8">
                <div className="container">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center space-y-4">
                                <div className="relative w-full">
                                    <div className="aspect-square bg-muted/40 backdrop-blur-sm rounded-2xl border border-border/20 shadow-sm flex items-center justify-center">
                                        <div className="h-10 w-10 bg-muted/60 rounded-full"></div>
                                    </div>
                                    {/* Decorative elements */}
                                    <div className="absolute -z-10 w-full h-full top-2 left-2 rounded-2xl bg-primary/5 blur-sm"></div>
                                </div>
                                <div className="h-4 w-20 bg-muted/60 rounded-full mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-8">
                <div className="container">
                    <div className="bg-destructive/10 backdrop-blur-sm rounded-xl p-6 border border-destructive/20">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </div>
                            <p className="text-destructive font-medium mb-2">Oops! Something went wrong</p>
                            <p className="text-muted-foreground text-center">{error}</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            <div className="container">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {categories.map((category) => {
                        const config = CATEGORY_CONFIG[category.name] || {
                            icon: BookOpen, // A sensible default
                            color: "text-gray-500"
                        };
                        const IconComponent = config.icon;

                        // Extract color without 'text-' prefix for background
                        const colorClass = config.color.replace('text-', '');

                        //Hide Other category
                        if (category.name === "Other") {
                            return null;
                        }
                        
                        return (
                            <div
                                key={category.id}
                                className="group cursor-pointer"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <div className="relative mb-4">
                                    {/* Main card */}
                                    <div className="aspect-square bg-background/80 backdrop-blur-sm rounded-2xl border border-border/40
                                                   flex items-center justify-center transition-all duration-300 ease-in-out
                                                   group-hover:scale-[1.03] group-hover:shadow-lg group-hover:border-primary/30
                                                   relative z-10 overflow-hidden">
                                        {/* Subtle gradient background that changes based on category */}
                                        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}></div>
                                        
                                        {/* Icon with glowing effect on hover */}
                                        <div className="relative">
                                            <div className={`absolute -inset-1 ${config.color}/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className={`relative w-16 h-16 rounded-full ${config.color}/10 flex items-center justify-center`}>
                                                <IconComponent className={`w-8 h-8 ${config.color} transition-transform group-hover:scale-110`} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative background element */}
                                    <div className={`absolute -z-10 w-full h-full top-2 left-2 rounded-2xl ${config.color}/5 blur-sm opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105`}></div>
                                </div>
                                
                                {/* Category name with hover effect */}
                                <div className="text-center">
                                    <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                                        {category.name}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

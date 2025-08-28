'use client';

import {CategoryResponseWithParentName} from "@/types/category";
import {useEffect, useState} from "react";
import {fetchParentCategories} from "@/lib/actions/public/categoryActions";
import {
    BookOpen,
    Music,
    Brush, // Using Brush for 'Arts & Theatre'
    Utensils,
    Dumbbell,
    Users,
    PartyPopper, // Example for Nightlife/Holidays
    Briefcase, // Example for Business
    Heart, // Example for Dating
    Gamepad2, // Example for Hobbies
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Enhanced CATEGORY_CONFIG to better match the visual style ---
// I've added more icons to demonstrate flexibility.
// You can map your actual category names to these.
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    // Keep your existing ones
    "Workshops & Education": {icon: BookOpen, color: "text-blue-500"},
    "Music": {icon: Music, color: "text-purple-500"},
    "Arts & Theatre": {icon: Brush, color: "text-pink-500"},
    "Performing & Visual Arts": {icon: Brush, color: "text-pink-500"}, // Alias for consistency
    "Food & Drink": {icon: Utensils, color: "text-amber-500"},
    "Sports & Fitness": {icon: Dumbbell, color: "text-green-500"},
    "Community & Social": {icon: Users, color: "text-teal-500"},

    // Adding more based on common categories, similar to your image
    "Nightlife": {icon: PartyPopper, color: "text-indigo-500"},
    "Holidays": {icon: PartyPopper, color: "text-red-500"},
    "Business": {icon: Briefcase, color: "text-gray-600"},
    "Dating": {icon: Heart, color: "text-rose-500"},
    "Hobbies": {icon: Gamepad2, color: "text-cyan-500"},
};

// --- Skeleton Component for a cleaner loading state ---
const CategorySkeleton = () => (
    <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <div className="w-24 h-24 bg-muted rounded-full"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
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
                    <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <CategorySkeleton key={i} />
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
                    <p className="text-center text-red-500">{error}</p>
                </div>
            </section>
        );
    }

    // Note: You might need a scrollbar hiding plugin for Tailwind if you want to hide it completely
    // e.g., `tailwind-scrollbar-hide` and then add the `scrollbar-hide` class to the div below.
    return (
        <section className="py-8">
            <div className="container">
                <div className="flex gap-4 md:gap-6 justify-center">
                    {categories.map((category) => {
                        const config = CATEGORY_CONFIG[category.name] || {
                            icon: BookOpen, // A sensible default
                            color: "text-gray-500"
                        };
                        const IconComponent = config.icon;

                        return (
                            <div
                                key={category.id}
                                className="flex flex-col items-center justify-start gap-3 group cursor-pointer"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <div
                                    className="w-24 h-24 rounded-full bg-slate-100 dark:bg-muted/50 border border-transparent
                                               flex items-center justify-center transition-all duration-300 ease-in-out
                                               group-hover:scale-110 group-hover:shadow-md group-hover:border-slate-200 dark:group-hover:border-muted"
                                >
                                    <IconComponent className={`w-10 h-10 transition-colors ${config.color}`} />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                                    {category.name}
                                </h3>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

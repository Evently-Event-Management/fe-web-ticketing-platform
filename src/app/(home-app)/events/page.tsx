import {fetchAllCategories} from '@/lib/actions/public/categoryActions';
import {EventFilters} from './_components/EventFilters';
import {EventResults} from './_components/EventResult';
import {Suspense} from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import Image from 'next/image';
import {CategoryFilterBar} from './_components/CategoryFilterBar';
import {EventAdvancedFilters} from './_components/EventAdvancedFilters';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Browse Events | Ticketly',
    description: 'Explore upcoming concerts, workshops, and festivals happening across Sri Lanka.'
};

export const revalidate = 300;

// A simpler skeleton for the new filter bar
const FilterSkeleton = () => (
    <div className="w-full max-w-3xl mx-auto">
        <Skeleton className="h-16 w-full rounded-full"/>
    </div>
);

const CategoryBarSkeleton = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-6">
        <Skeleton className="h-9 w-28 rounded-md"/>
        <Skeleton className="h-9 w-36 rounded-md"/>
        <Skeleton className="h-9 w-24 rounded-md"/>
        <Skeleton className="h-9 w-40 rounded-md"/>
        <Skeleton className="h-9 w-32 rounded-md"/>
    </div>
);


export default async function EventsPage() {
    const categories = await fetchAllCategories();

    return (
        <main>
            {/* HERO SECTION REVAMP */}
            <section className="relative bg-background">
                {/* New, more vibrant background image */}
                <div className="absolute inset-0 h-[450px] w-full">
                    <Image
                        src={'https://images.unsplash.com/photo-1669033425101-a9660d531a00?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                        alt="Vibrant event background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-background dark:via-background/80 dark:to-black/30"/>
                </div>

                {/* Content overlay */}
                <div className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center min-h-[450px]">
                    <div className="text-center mb-8 text-white">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
                            Find Your Next Experience
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/90 drop-shadow-sm">
                            Discover concerts, workshops, and festivals happening across Sri Lanka.
                        </p>
                    </div>

                    {/* Filter component is now centered and has a max-width */}
                    <div className="w-full max-w-3xl">
                        <Suspense fallback={<FilterSkeleton/>}>
                            <EventFilters/>
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* RESULTS SECTION (No changes here) */}
            <section className="md:max-w-7xl mx-auto px-4 py-8 space-y-8"> {/* Negative margin to pull results up */}
                <Suspense fallback={<CategoryBarSkeleton/>}>
                    <CategoryFilterBar categories={categories}/>
                </Suspense>
                <div className="flex justify-end">
                    <Suspense fallback={<div className="h-9 w-32 animate-pulse rounded-full bg-muted"/>}>
                        <EventAdvancedFilters/>
                    </Suspense>
                </div>
                <Suspense fallback={<div className="text-center py-10">Loading results...</div>}>
                    <EventResults/>
                </Suspense>
            </section>
        </main>
    );
}
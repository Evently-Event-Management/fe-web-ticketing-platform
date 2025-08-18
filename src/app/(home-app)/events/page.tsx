import {fetchParentCategories} from '@/lib/actions/public/categoryActions';
import {EventFilters} from './_components/EventFilters';
import {EventResults} from './_components/EventResult';
import {Suspense} from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import Image from 'next/image';

// Loading component for the filter section
const FilterSkeleton = () => (
    <div className="w-full max-w-4xl mx-auto space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
        <Skeleton className="h-8 w-1/2"/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4"/>
                <Skeleton className="h-10 w-full"/>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4"/>
                <Skeleton className="h-10 w-full"/>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4"/>
                <Skeleton className="h-10 w-full"/>
            </div>
        </div>
    </div>
);

export default async function EventsPage() {
    // Fetch categories on the server
    const categories = await fetchParentCategories();

    return (
        <main>
            {/* Hero section with background image and filters on top */}
            <section className="relative">
                {/* Background image */}
                <div className="absolute inset-0 h-[400px] w-full">
                    <Image
                        src={'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                        alt="Events background"
                        fill
                        className="object-cover brightness-50 dark:brightness-45"
                        priority
                    />
                </div>

                {/* Content overlay */}
                <div className="relative pt-16 pb-32 px-4 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center mb-8 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Your Next Experience</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                            Discover amazing events happening across Sri Lanka.
                        </p>
                    </div>

                    {/* Filter component */}
                    <div className="w-full max-w-4xl">
                        <Suspense fallback={<FilterSkeleton/>}>
                            <EventFilters categories={categories} inHero={true}/>
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* Results section */}
            <section className="md:max-w-7xl mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center py-10">Loading results...</div>}>
                    <EventResults/>
                </Suspense>
            </section>
        </main>
    );
}
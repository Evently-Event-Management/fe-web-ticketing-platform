import {fetchParentCategories} from '@/lib/actions/public/categoryActions'; // Adjust path
import {EventFilters} from './_components/EventFilters';
import {EventResults} from './_components/EventResult';
import {Suspense} from 'react';
import {Skeleton} from '@/components/ui/skeleton';

// Loading component for the filter section
const FilterSkeleton = () => (
    <aside className="p-6 bg-muted/50 rounded-lg space-y-6">
        <Skeleton className="h-8 w-1/2"/>
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
    </aside>
);


export default async function EventsPage({searchParams}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // Fetch categories on the server
    const categories = await fetchParentCategories();

    return (
        <main className="container py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Your Next Experience</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Discover amazing events happening across Sri Lanka.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Column */}
                <div className="col-span-1">
                    <Suspense fallback={<FilterSkeleton/>}>
                        <EventFilters categories={categories}/>
                    </Suspense>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-3">
                    <Suspense fallback={<div>Loading results...</div>}>
                        <EventResults/>
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
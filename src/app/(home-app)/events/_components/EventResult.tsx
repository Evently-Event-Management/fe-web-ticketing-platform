'use client';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {EventSearchResult, searchEvents} from '@/lib/actions/public/eventActions'; // Correct path
import {EventCard} from '../../_components/EventCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import {Skeleton} from '@/components/ui/skeleton';
import {Frown} from 'lucide-react';

const EventSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-48 w-full"/>
        <Skeleton className="h-4 w-3/4"/>
        <Skeleton className="h-4 w-1/2"/>
    </div>
);


export function EventResults() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<EventSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndSetEvents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Extract params from URL
                const params = {
                    searchTerm: searchParams.get('searchTerm') || undefined,
                    categoryId: searchParams.get('categoryId') || undefined,
                    latitude: searchParams.has('latitude') ? Number(searchParams.get('latitude')) : undefined,
                    longitude: searchParams.has('longitude') ? Number(searchParams.get('longitude')) : undefined,
                    radiusKm: searchParams.has('radiusKm') ? Number(searchParams.get('radiusKm')) : undefined,
                    dateFrom: searchParams.get('dateFrom') || undefined,
                    dateTo: searchParams.get('dateTo') || undefined,
                    priceMin: (() => {
                        const value = searchParams.get('priceMin');
                        if (value === null || value.trim() === '') return undefined;
                        const parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : undefined;
                    })(),
                    priceMax: (() => {
                        const value = searchParams.get('priceMax');
                        if (value === null || value.trim() === '') return undefined;
                        const parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : undefined;
                    })(),
                    page: searchParams.has('page') ? Number(searchParams.get('page')) : 0,
                };
                const result = await searchEvents(params);
                setData(result);
            } catch (err) {
                setError('Could not load events. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSetEvents();
    }, [searchParams]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <EventSkeleton key={i}/>)}
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500 col-span-full">{error}</p>;
        }
        if (!data || data.content.length === 0) {
            return (
                <div className="text-center col-span-full py-16">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <h3 className="mt-4 text-lg font-semibold">No Events Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.content.map(event => <EventCard key={event.id} event={event}/>)}
            </div>
        );
    }

    // Pagination Logic
    const page = data?.number || 0;
    const totalPages = data?.totalPages || 1;
    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `/events?${params.toString()}`;
    };

    return (
        <div className="space-y-8">
            {renderContent()}

            {data && data.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            {page > 0 ? (
                                <PaginationPrevious href={createPageURL(page - 1)}/>
                            ) : (
                                <PaginationPrevious className="pointer-events-none opacity-50"/>
                            )}
                        </PaginationItem>
                        {/* We can add page number links here if needed */}
                        <PaginationItem>
                            <span className="p-2 text-sm">
                                Page {page + 1} of {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            {page < totalPages - 1 ? (
                                <PaginationNext href={createPageURL(page + 1)}/>
                            ) : (
                                <PaginationNext className="pointer-events-none opacity-50"/>
                            )}
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
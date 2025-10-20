'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Input} from '@/components/ui/input';
import {searchEvents} from '@/lib/actions/public/eventActions';
import {EventThumbnailDTO} from '@/types/event';
import {Loader2, Search, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {TopbarEventCard} from './TopbarEventCard';
import Link from 'next/link';
import {cn} from '@/lib/utils';

interface TopbarEventSearchProps {
    className?: string;
    autoFocus?: boolean;
    onClose?: () => void;
}

const DEBOUNCE_MS = 1000;
const RESULT_LIMIT = 6;

export function TopbarEventSearch({className, autoFocus = false, onClose}: TopbarEventSearchProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<EventThumbnailDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const resetSearch = useCallback(() => {
        setResults([]);
        setIsPanelOpen(false);
        setIsLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            resetSearch();
            return;
        }

        setIsLoading(true);
        setError(null);
        const timeoutId = window.setTimeout(async () => {
            const currentRequestId = ++requestIdRef.current;
            try {
                const response = await searchEvents({
                    searchTerm: query.trim(),
                    size: RESULT_LIMIT,
                });
                if (requestIdRef.current === currentRequestId) {
                    setResults(response.content ?? []);
                    setIsPanelOpen(true);
                }
            } catch (err) {
                if (requestIdRef.current === currentRequestId) {
                    setError('Something went wrong. Try again later.');
                    setResults([]);
                    setIsPanelOpen(true);
                }
            } finally {
                if (requestIdRef.current === currentRequestId) {
                    setIsLoading(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timeoutId);
    }, [query, resetSearch]);

    const hasResults = results.length > 0;
    const showEmptyState = !isLoading && !error && query.trim().length > 0 && !hasResults;

    const clearButton = useMemo(() => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => {
                setQuery('');
                resetSearch();
            }}
        >
            <X className="h-4 w-4"/>
            <span className="sr-only">Clear search</span>
        </Button>
    ), [resetSearch]);

    return (
        <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
            <div className="flex items-center rounded-full border bg-background px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-primary/40">
                <Search className="mr-2 h-4 w-4 text-muted-foreground"/>
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => {
                        if (results.length > 0 || error) {
                            setIsPanelOpen(true);
                        }
                    }}
                    placeholder="Search events..."
                    className="h-auto border-0 p-0 focus-visible:ring-0 !bg-transparent flex-grow !shadow-none"
                    autoFocus={autoFocus}
                />
                {query ? clearButton : null}
            </div>

            {isPanelOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-popover shadow-xl">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <p className="text-sm font-medium text-foreground">Search results</p>
                        <Link
                            href="/events"
                            className="text-sm font-medium text-primary hover:underline"
                            onClick={() => {
                                setQuery('');
                                resetSearch();
                                onClose?.();
                            }}
                        >
                            All events &gt;
                        </Link>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                        {isLoading && (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Searching events...
                            </div>
                        )}
                        {error && (
                            <div className="py-6 text-center text-sm text-destructive">{error}</div>
                        )}
                        {showEmptyState && (
                            <div className="py-6 text-center text-sm text-muted-foreground">No matching events found.</div>
                        )}
                        {hasResults && !isLoading && results.map((event) => (
                            <TopbarEventCard
                                key={event.id}
                                event={event}
                                onNavigate={() => {
                                    setQuery('');
                                    setIsPanelOpen(false);
                                    resetSearch();
                                    onClose?.();
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {useDebounce} from 'use-debounce';
import {PlusCircle} from 'lucide-react';

import {getMyOrganizationEvents} from '@/lib/actions/eventActions';
import {EventStatus, EventSummaryDTO} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import {EventCard} from "../_components/EventCard";
import {Skeleton} from "@/components/ui/skeleton";

// --- Main Page Component ---
export default function OrganizationEventsPage() {
    const params = useParams();
    const organizationId = params.organization_id as string;

    const [events, setEvents] = useState<EventSummaryDTO[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');

    const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Debounce search input

    useEffect(() => {
        setIsLoading(true);
        getMyOrganizationEvents(
            organizationId,
            statusFilter === 'ALL' ? undefined : statusFilter,
            debouncedSearchTerm,
            page,
            10 // Page size
        ).then(data => {
            setEvents(data.content);
            setTotalPages(data.totalPages);
        }).catch(err => {
            console.error(err);
            // Add toast notification for error
        }).finally(() => {
            setIsLoading(false);
        });
    }, [organizationId, page, debouncedSearchTerm, statusFilter]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">
                        View and manage all events for your organization.
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/manage/organization/${organizationId}/event/create`}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Create Event
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search events by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as EventStatus | 'ALL')}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {isLoading
                    ? Array.from({length: 3}).map((_, index) => (
                        <div key={`event-skeleton-${index}`} className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                            <Skeleton className="h-24 w-full"/>
                            <div className="space-y-3 p-4">
                                <Skeleton className="h-4 w-48"/>
                                <Skeleton className="h-3 w-64"/>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Skeleton className="h-10 w-full"/>
                                    <Skeleton className="h-10 w-full"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                            </div>
                        </div>
                    ))
                    : events.length === 0
                        ? (
                            <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 text-center text-sm text-muted-foreground">
                                <p>No events found for this organization.</p>
                                <p>Adjust your filters or create a new event.</p>
                            </div>
                        )
                        : events.map(event => (
                            <EventCard key={event.id} event={event} organizationId={organizationId}/>
                        ))}
            </div>

            {/* ✅ Pagination is now handled here */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => setPage(p => Math.max(0, p - 1))}
                                                aria-disabled={page === 0}/>
                        </PaginationItem>
                        {/* You can add more complex page number logic here if needed */}
                        <PaginationItem>
                            <PaginationLink isActive>
                                {page + 1}
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis/>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                            aria-disabled={page >= totalPages - 1}/>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

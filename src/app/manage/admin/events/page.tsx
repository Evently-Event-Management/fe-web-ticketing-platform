'use client';

import * as React from 'react';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {useDebounce} from 'use-debounce';
import {ColumnDef} from '@tanstack/react-table';
import {MoreHorizontal, Eye} from 'lucide-react';
import {format, parseISO} from 'date-fns';

import {getAllEvents_Admin} from '@/lib/actions/eventActions';
import {EventStatus, EventSummaryDTO} from '@/lib/validators/event';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import Image from 'next/image';
import {DataTable} from "@/components/DataTable";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import {toast} from 'sonner';

// --- Helper to get status badge color ---
const getStatusVariant = (status: EventStatus): "default" | "secondary" | "destructive" | "success" | "warning" => {
    switch (status) {
        case EventStatus.APPROVED:
            return 'success';
        case EventStatus.PENDING:
            return 'warning';
        case EventStatus.REJECTED:
            return 'destructive';
        case EventStatus.COMPLETED:
            return 'secondary';
        default:
            return 'secondary';
    }
};

// --- Main Page Component ---
export default function AdminEventsPage() {
    const router = useRouter();

    const [events, setEvents] = useState<EventSummaryDTO[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Debounce search input

    const fetchEvents = useCallback(() => {
        setIsLoading(true);
        getAllEvents_Admin(
            statusFilter === 'ALL' ? undefined : statusFilter as EventStatus,
            debouncedSearchTerm,
            page,
            10 // Page size
        ).then(data => {
            setEvents(data.content);
            setTotalPages(data.totalPages);
        }).catch(err => {
            console.error(err);
            toast.error("Failed to fetch events");
        }).finally(() => {
            setIsLoading(false);
        });
    }, [statusFilter, debouncedSearchTerm, page]);

    useEffect(() => {
        fetchEvents();
    }, [page, debouncedSearchTerm, statusFilter, fetchEvents]);


    const columns = useMemo<ColumnDef<EventSummaryDTO>[]>(() => [
        {
            accessorKey: 'title',
            header: 'Event',
            cell: ({row}) => {
                const event = row.original;
                return (
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-28 rounded-md overflow-hidden bg-muted">
                            {event.coverPhoto && (
                                <Image src={event.coverPhoto} alt={event.title} fill className="object-cover"/>
                            )}
                        </div>
                        <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{event.description}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'organizationName',
            header: 'Organization',
            cell: ({row}) => (
                <span>{row.original.organizationName}</span>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({row}) => (
                <Badge variant={getStatusVariant(row.original.status as EventStatus)}>{row.original.status}</Badge>
            )
        },
        {
            accessorKey: 'sessionCount',
            header: 'Sessions',
            cell: ({row}) => (
                <span>{row.original.sessionCount}</span>
            )
        },
        {
            accessorKey: 'earliestSessionDate',
            header: 'Next Date',
            cell: ({row}) => (
                <span>
                    {row.original.earliestSessionDate
                        ? format(parseISO(row.original.earliestSessionDate), 'MMM d, yyyy')
                        : 'Not scheduled'}
                </span>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({row}) => (
                <span>{format(parseISO(row.original.createdAt), 'MMM d, yyyy')}</span>
            )
        },
        {
            id: 'actions',
            cell: ({row}) => {
                const event = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => router.push(`/manage/admin/events/${event.id}`)}>
                                    <Eye className="mr-2 h-4 w-4"/> View Details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ], [router]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
                <p className="text-muted-foreground">
                    View and manage all events across all organizations.
                </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
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

            <DataTable
                columns={columns}
                data={events}
                isLoading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                aria-disabled={page === 0}
                                className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            // Show first page, last page, and pages around current page
                            let pageToShow = i;
                            if (page > 2 && totalPages > 5) {
                                if (i === 0) pageToShow = 0;
                                else if (i === 4) pageToShow = totalPages - 1;
                                else pageToShow = page + i - 2;
                            }

                            return (
                                <PaginationItem key={pageToShow}>
                                    {(i === 1 && page > 2 && totalPages > 5) ? (
                                        <PaginationEllipsis/>
                                    ) : (i === 3 && page < totalPages - 3 && totalPages > 5) ? (
                                        <PaginationEllipsis/>
                                    ) : (
                                        <PaginationLink
                                            isActive={pageToShow === page}
                                            onClick={() => setPage(pageToShow)}
                                        >
                                            {pageToShow + 1}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                aria-disabled={page >= totalPages - 1}
                                className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

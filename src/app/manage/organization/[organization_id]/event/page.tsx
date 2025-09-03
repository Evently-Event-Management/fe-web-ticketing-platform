'use client';

import * as React from 'react';
import {useState, useEffect, useMemo} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {useDebounce} from 'use-debounce';
import {ColumnDef} from '@tanstack/react-table';
import {MoreHorizontal, PlusCircle, Trash2, Eye} from 'lucide-react';
import {format, parseISO} from 'date-fns';

import {getMyOrganizationEvents} from '@/lib/actions/eventActions';
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
import Link from 'next/link';
import Image from 'next/image';
import {DataTable} from "@/components/DataTable";
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

// --- Helper to get status badge color ---
const getStatusVariant = (status: EventStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'APPROVED':
            return 'default';
        case 'PENDING':
            return 'secondary';
        case 'REJECTED':
            return 'destructive';
        default:
            return 'secondary';
    }
};

// --- Main Page Component ---
export default function OrganizationEventsPage() {
    const params = useParams();
    const router = useRouter();
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
            accessorKey: 'status',
            header: 'Status',
            cell: ({row}) => (
                <Badge variant={getStatusVariant(row.original.status)}>{row.original.status}</Badge>
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
                <span>{format(parseISO(row.original.earliestSessionDate), 'MMM d, yyyy')}</span>
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
                                    onClick={() => router.push(`/manage/organization/${organizationId}/event/${event.id}`)}>
                                    <Eye className="mr-2 h-4 w-4"/> View
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ], [router, organizationId]);

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

            <DataTable
                columns={columns}
                data={events}
                isLoading={isLoading}
            />

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

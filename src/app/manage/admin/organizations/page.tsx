'use client';

import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ColumnDef} from '@tanstack/react-table';
import {useDebounce} from 'use-debounce';
import {differenceInDays, format, parseISO} from 'date-fns';
import {Copy, ExternalLink, MoreHorizontal, RefreshCcw} from 'lucide-react';
import {toast} from 'sonner';

import {getAllOrganizations_Admin} from '@/lib/actions/organizationActions';
import {OrganizationResponse} from '@/types/oraganizations';
import {DataTable} from '@/components/DataTable';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;
const NEW_ORG_DAYS = 14;

function isNewOrganization(createdAt: string): boolean {
    try {
        return differenceInDays(new Date(), parseISO(createdAt)) <= NEW_ORG_DAYS;
    } catch (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _error
    ) {
        return false;
    }
}

function normalizeWebsiteUrl(website?: string): string | null {
    if (!website) {
        return null;
    }
    const trimmed = website.trim();
    if (!trimmed) {
        return null;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

export default function AdminOrganizationsPage() {
    const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalOrganizations, setTotalOrganizations] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 400);

    const fetchOrganizations = useCallback(() => {
        setIsLoading(true);
        setError(null);
        getAllOrganizations_Admin(
            debouncedSearchTerm,
            page,
            PAGE_SIZE
        ).then((response) => {
            setOrganizations(response.content);
            setTotalPages(response.totalPages);
            setTotalOrganizations(response.totalElements);
        }).catch(err => {
            console.error('Failed to fetch organizations', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch organizations';
            setError(message);
            toast.error(message);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [debouncedSearchTerm, page]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handleCopyId = useCallback(async (organizationId: string) => {
        try {
            await navigator.clipboard.writeText(organizationId);
            toast.success('Organization ID copied to clipboard');
        } catch (err) {
            console.error('Failed to copy organization ID', err);
            toast.error('Unable to copy organization ID');
        }
    }, []);

    const columns = useMemo<ColumnDef<OrganizationResponse>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Organization',
            cell: ({row}) => {
                const organization = row.original;
                return (
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {organization.logoUrl ? (
                                <Image
                                    src={organization.logoUrl}
                                    alt={`${organization.name} logo`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-sm font-medium text-muted-foreground">
                                    {organization.name?.charAt(0)?.toUpperCase() ?? '?'}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{organization.name}</span>
                                {isNewOrganization(organization.createdAt) && (
                                    <Badge variant="success">New</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">ID: {organization.id}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'eventCount',
            header: 'Events',
            cell: ({row}) => {
                const count = row.original.eventCount;
                return <span>{typeof count === 'number' ? count : '—'}</span>;
            }
        },
        {
            accessorKey: 'website',
            header: 'Website',
            cell: ({row}) => {
                const websiteUrl = normalizeWebsiteUrl(row.original.website);
                if (!websiteUrl) {
                    return <span className="text-muted-foreground">—</span>;
                }

                return (
                    <Link
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        <span className="truncate max-w-[160px]">{websiteUrl.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="h-3.5 w-3.5"/>
                    </Link>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({row}) => {
                const createdAt = row.original.createdAt;
                return (
                    <span>
                        {createdAt ? format(parseISO(createdAt), 'MMM d, yyyy') : '—'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated',
            cell: ({row}) => {
                const updatedAt = row.original.updatedAt;
                return (
                    <span className="text-muted-foreground">
                        {updatedAt ? format(parseISO(updatedAt), 'MMM d, yyyy') : '—'}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            cell: ({row}) => {
                const organization = row.original;
                const websiteUrl = normalizeWebsiteUrl(organization.website);
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => void handleCopyId(organization.id)}>
                                <Copy className="mr-2 h-4 w-4"/>
                                Copy organization ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem asChild disabled={!websiteUrl}>
                                <Link
                                    href={websiteUrl ?? '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={!websiteUrl ? 'pointer-events-none opacity-50' : ''}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4"/>
                                    Visit website
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ], [handleCopyId]);

    return (
        <div className="space-y-6 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Organizations Directory</h1>
                    <Badge variant="secondary">{totalOrganizations.toLocaleString('en-LK')} total</Badge>
                </div>
                <p className="text-muted-foreground">
                    Browse and manage every organization in the Ticketly platform.
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>We couldn&apos;t load organizations</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{error}</span>
                        <Button size="sm" variant="outline" onClick={() => fetchOrganizations()}>
                            <RefreshCcw className="mr-2 h-4 w-4"/>
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap items-center gap-4">
                <Input
                    placeholder="Search by name or website..."
                    value={searchTerm}
                    onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setPage(0);
                    }}
                    className="max-w-sm"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOrganizations()}
                    disabled={isLoading}
                >
                    <RefreshCcw className="mr-2 h-4 w-4"/>
                    Refresh
                </Button>
            </div>

            <DataTable columns={columns} data={organizations} isLoading={isLoading}/>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                aria-disabled={page === 0}
                                className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {Array.from({length: Math.min(5, totalPages)}, (_, index) => {
                            let pageToShow = index;
                            if (page > 2 && totalPages > 5) {
                                if (index === 0) pageToShow = 0;
                                else if (index === 4) pageToShow = totalPages - 1;
                                else pageToShow = page + index - 2;
                            }

                            if (pageToShow < 0 || pageToShow >= totalPages) {
                                return null;
                            }

                            const showEllipsis = (
                                (index === 1 && page > 2 && totalPages > 5) ||
                                (index === 3 && page < totalPages - 3 && totalPages > 5)
                            );

                            return (
                                <PaginationItem key={`${index}-${pageToShow}`}>
                                    {showEllipsis ? (
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
                                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
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

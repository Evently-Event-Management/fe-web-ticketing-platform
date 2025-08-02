'use client'

import {deleteSeatingLayoutTemplate, getSeatingLayoutTemplatesByOrg} from '@/lib/actions/seatingLayoutTemplateActions';
import {PaginatedResponse, SeatingLayoutTemplateResponse} from '@/types/seating-layout';
import {useParams} from 'next/navigation';

import React, {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusCircle} from 'lucide-react';
import {Skeleton} from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import LayoutPreviewCard from "@/app/manage/organization/[organization_id]/seating/_components/LayoutPreviewCard";

export default function SeatingLayoutsPage() {
    const params = useParams();
    const organizationId = params.organization_id as string;

    const [data, setData] = useState<PaginatedResponse<SeatingLayoutTemplateResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const pageSize = 6;

    const fetchLayouts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getSeatingLayoutTemplatesByOrg(organizationId, page, pageSize);
            setData(response);
        } catch (error) {
            console.error("Failed to fetch seating layouts:", error);
            toast.error("Failed to fetch seating layouts.");
        } finally {
            setIsLoading(false);
        }
    }, [organizationId, page, pageSize]);

    useEffect(() => {
        fetchLayouts().then();
    }, [fetchLayouts]);

    const handleDelete = (id: string, name: string) => {
        toast.promise(deleteSeatingLayoutTemplate(id), {
            loading: `Deleting "${name}"...`,
            success: async () => {
                // Refetch data after successful deletion
                await fetchLayouts();
                return `Layout "${name}" deleted successfully.`;
            },
            error: (err) => err.message || 'Failed to delete layout.',
        });
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Seating Layouts</h1>
                    <p className="text-muted-foreground">
                        Manage reusable seating templates for your events.
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/manage/organization/${organizationId}/seating/create`}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Create New Layout
                    </Link>
                </Button>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: pageSize}).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full"/>
                    ))}
                </div>
            )}

            {!isLoading && data && data.content.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.content.map(layout => (
                        <LayoutPreviewCard key={layout.id} layout={layout} onDelete={handleDelete}/>
                    ))}
                </div>
            )}

            {!isLoading && (!data || data.empty) && (
                <div
                    className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-64">
                    <h3 className="text-xl font-semibold">No Layouts Found</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Get started by creating your first seating
                        layout.</p>
                </div>
            )}

            {data && data.totalPages > 1 && (
                <Pagination className="mt-8">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => setPage(p => p - 1)} aria-disabled={data.first}/>
                        </PaginationItem>
                        <PaginationItem>
                            <span className="p-2 text-sm">Page {data.number + 1} of {data.totalPages}</span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext onClick={() => setPage(p => p + 1)} aria-disabled={data.last}/>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

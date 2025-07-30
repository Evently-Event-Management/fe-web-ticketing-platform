'use client';

import * as React from 'react';
import {useOrganization} from '@/providers/OrganizationProvider';
import {ColumnDef} from '@tanstack/react-table';
import {MoreHorizontal, PlusCircle} from 'lucide-react';

import {OrganizationResponse} from '@/types/oraganizations';
import {Button} from '@/components/ui/button';
import {DataTable} from './_components/DataTable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Skeleton} from '@/components/ui/skeleton';
import {DeleteOrganizationDialog, CreateOrganizationDialog} from "@/components/OrganizationDialog";
import {useRouter} from "next/navigation";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"


export default function OrganizationsPage() {
    const {organizations, isLoading} = useOrganization();
    const router = useRouter()

    // Define columns for the data table
    const columns: ColumnDef<OrganizationResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Organization Name',
            cell: ({row}) => {
                const org = row.original;
                return (
                    <div className="flex items-center gap-3">
                        {/* Placeholder for a logo */}
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={org.logoUrl || '/default-logo.png'} alt={org.name}/>
                            <AvatarFallback>{org.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{org.name}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'events', // Dummy accessor key
            header: 'Events',
            cell: () => {
                // Dummy data for event count
                return <span>{Math.floor(Math.random() * 25)}</span>;
            },
        },
        {
            id: 'actions',
            cell: ({row}) => {
                const organization = row.original;
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
                                    onClick={() => navigator.clipboard.writeText(organization.id)}
                                >
                                    Copy organization ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    router.push(`/manage/organization/${organization.id}/edit`);
                                }}>
                                    Edit
                                </DropdownMenuItem>
                                <DeleteOrganizationDialog organization={organization}>
                                    {/* This is the trigger for the delete dialog */}
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()} // Prevents DropdownMenu from closing
                                        className="text-destructive"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DeleteOrganizationDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Show a loading state with skeletons
    if (isLoading && organizations.length === 0) {
        return (
            <div className="p-4 md:p-8 space-y-4">
                <Skeleton className="h-10 w-1/3"/>
                <Skeleton className="h-12 w-full"/>
                <Skeleton className="h-12 w-full"/>
                <Skeleton className="h-12 w-full"/>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage all your organizations in one place.
                    </p>
                </div>
                <CreateOrganizationDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Create Organization
                    </Button>
                </CreateOrganizationDialog>
            </div>
            <DataTable columns={columns} data={organizations}/>
        </div>
    );
}

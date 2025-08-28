"use client";

import React from 'react';
import {ColumnDef} from '@tanstack/react-table';
import {DataTable} from '@/components/DataTable';
import {OrganizationMemberResponse} from '@/types/oraganizations';
import {Button} from '@/components/ui/button';
import {Trash2Icon} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StaffTableProps {
    staffMembers: OrganizationMemberResponse[];
    isLoading: boolean;
    onRemove: (userId: string) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
                                                          staffMembers,
                                                          isLoading,
                                                          onRemove
                                                      }) => {
    const columns: ColumnDef<OrganizationMemberResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({row}) => {
                const name = row.original.name;
                // Handle cases where name might be "null null" (user hasn't accepted invitation)
                if (!name || name === "null null" || name === "null") {
                    return (
                        <span className="text-muted-foreground italic">Pending invitation</span>
                    );
                }
                return name;
            }
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({row}) => {
                const roles = row.original.roles;
                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                            <Badge key={role} variant="outline">
                                {role}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({row}) => {
                const member = row.original;

                return (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2Icon className="h-4 w-4 text-destructive"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove staff member</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove {member.name} ({member.email}) from this
                                    organization?
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onRemove(member.userId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Remove
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={staffMembers}
            isLoading={isLoading}
        />
    );
};

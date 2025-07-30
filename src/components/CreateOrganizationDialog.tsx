'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useOrganization } from '@/providers/OrganizationProvider';
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
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export function CreateOrganizationDialog() {
    const { createOrganization } = useOrganization();
    const [newOrgName, setNewOrgName] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const handleCreate = async () => {
        if (!newOrgName.trim()) return;
        try {
            await createOrganization({ name: newOrgName });
            setNewOrgName(''); // Reset input field
            setIsOpen(false); // Close the dialog on success
        } catch (error) {
            console.error("Failed to create organization:", error);
            // Optionally, show an error toast to the user
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {/* This DropdownMenuItem will now act as the trigger for the dialog */}
                <DropdownMenuItem
                    className="gap-2 p-2"
                    onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                        <Plus className="size-4" />
                    </div>
                    <div className="font-medium">Create Organization</div>
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create a new organization</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a name for your new organization. This can be changed later.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    placeholder="e.g., Acme Inc."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreate} disabled={!newOrgName.trim()}>
                        Create
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import React, {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {getOrganizationMembers, removeOrganizationMember} from '@/lib/actions/organizationActions';
import {OrganizationMemberResponse} from '@/types/oraganizations';
import {StaffTable} from './_components/StaffTable';
import {AddStaffDialog} from './_components/AddStaffDialog';
import {Button} from '@/components/ui/button';
import {PlusIcon} from 'lucide-react';
import { toast } from 'sonner';

const StaffManagementPage = () => {
    const {organization_id} = useParams() as { organization_id: string };
    const [staffMembers, setStaffMembers] = useState<OrganizationMemberResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const fetchStaffMembers = async () => {
            try {
                setIsLoading(true);
                const members = await getOrganizationMembers(organization_id);
                console.log('Fetched members:', members);
                setStaffMembers(members);
            } catch (error) {
                console.error('Failed to fetch staff members:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (organization_id) {
            fetchStaffMembers().then()
        }
    }, [organization_id]);

    const handleAddStaff = (newMember: OrganizationMemberResponse) => {
        setStaffMembers((prev) => [...prev, newMember]);
        setDialogOpen(false);
    };

    const handleRemoveStaff = async (userId: string) => {
        // Show loading toast while deleting
        const loadingToast = toast.loading('Removing staff member...');
        try {
            await removeOrganizationMember(organization_id, userId);
            setStaffMembers((prev) => prev.filter((member) => member.userId !== userId));

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Staff member removed successfully');
        } catch (error) {
            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            toast.error('Failed to remove staff member');
            console.error('Failed to remove staff member:', error);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4"/>
                    Add Staff
                </Button>
            </div>

            <StaffTable
                staffMembers={staffMembers}
                isLoading={isLoading}
                onRemove={handleRemoveStaff}
            />

            <AddStaffDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                organizationId={organization_id}
                onSuccess={handleAddStaff}
            />
        </div>
    );
};

export default StaffManagementPage;

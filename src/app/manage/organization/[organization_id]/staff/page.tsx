"use client";

import React, {useState, useEffect, useMemo} from "react";
import {useParams} from "next/navigation";
import {getOrganizationMembers, removeOrganizationMember, updateOrganizationMemberStatus} from "@/lib/actions/organizationActions";
import {OrganizationMemberResponse} from "@/types/oraganizations";
import {AddStaffDialog} from "./_components/AddStaffDialog";
import {Button} from "@/components/ui/button";
import {PlusIcon, Users} from "lucide-react";
import {toast} from "sonner";
import {StaffGrid} from "./_components/StaffGrid";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

const StaffManagementPage = () => {
    const {organization_id} = useParams() as { organization_id: string };
    const [staffMembers, setStaffMembers] = useState<OrganizationMemberResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const sortStaffMembers = (members: OrganizationMemberResponse[]) =>
        [...members].sort((a, b) =>
            Number(b.active) - Number(a.active) || (a.name ?? "").localeCompare(b.name ?? "")
        );

    useEffect(() => {
        const fetchStaffMembers = async () => {
            try {
                setIsLoading(true);
                const members = await getOrganizationMembers(organization_id);
                setStaffMembers(sortStaffMembers(members));
            } catch (error) {
                console.error("Failed to fetch staff members:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (organization_id) {
            void fetchStaffMembers();
        }
    }, [organization_id]);

    const handleAddStaff = (newMember: OrganizationMemberResponse) => {
        setStaffMembers(prev => sortStaffMembers([...prev.filter(member => member.userId !== newMember.userId), newMember]));
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

    const totalInvited = useMemo(() => staffMembers.length, [staffMembers]);
    const activeCount = useMemo(() => staffMembers.filter(member => member.active).length, [staffMembers]);
    const inactiveCount = useMemo(() => staffMembers.filter(member => !member.active).length, [staffMembers]);

    const handleToggleActive = async (userId: string, nextState: boolean) => {
        const previousMembers = staffMembers.map(member => ({...member}));
        const loadingToast = toast.loading(nextState ? "Activating staff member..." : "Pausing staff access...");

        setStaffMembers(prev => sortStaffMembers(prev
            .map(member => member.userId === userId ? {...member, active: nextState} : member)
        ));

        try {
            await updateOrganizationMemberStatus(organization_id, userId, nextState);
            toast.dismiss(loadingToast);
            toast.success(nextState ? "Staff member activated" : "Staff member deactivated");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed to update staff member status");
            console.error("Failed to update staff member status:", error);
            setStaffMembers(previousMembers);
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                        <Users className="h-4 w-4"/>
                        Team Roster
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Invite teammates, assign roles, and keep tabs on who is ready for your next event. Pending invites show here until accepted.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="lg" className="self-start lg:self-auto">
                    <PlusIcon className="mr-2 h-4 w-4"/>
                    Add staff member
                </Button>
            </div>

            <Card className="border-border/60 bg-muted/20">
                <CardContent className="flex flex-wrap items-center gap-6 p-6">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total team</p>
                        <p className="text-2xl font-semibold text-foreground">{totalInvited}</p>
                    </div>
                    <div className="h-10 w-px bg-border/60" aria-hidden="true"/>
                    <div className="flex items-center gap-3">
                        <Badge variant="success">Active</Badge>
                        <span className="text-sm text-muted-foreground">{activeCount} ready to work</span>
                    </div>
                    <div className="h-10 w-px bg-border/60" aria-hidden="true"/>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline">Inactive</Badge>
                        <span className="text-sm text-muted-foreground">{inactiveCount} awaiting activation</span>
                    </div>
                </CardContent>
            </Card>

            <StaffGrid
                staffMembers={staffMembers}
                isLoading={isLoading}
                onRemove={handleRemoveStaff}
                onToggleActive={handleToggleActive}
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

'use client';

import {OrganizationResponse} from "@/types/oraganizations";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";
import {getOrganizationById} from "@/lib/actions/organizationActions";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {LogoManagementCard} from "@/app/manage/organization/[organization_id]/edit/_components/LogoManagementCard";
import {ProfileDetailsCard} from "@/app/manage/organization/[organization_id]/edit/_components/InfoCard";
import {DangerZoneCard} from "@/app/manage/organization/[organization_id]/edit/_components/DangerZoneCard";

export default function OrganizationSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const organization_id = params.organization_id as string;

    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrgData = useCallback(async () => {
        try {
            const data = await getOrganizationById(organization_id);
            setOrganization(data);
        } catch (error) {
            toast.error("Failed to fetch organization details.");
            console.error("Error fetching organization:", error);
            router.push("/manage/organizations");
        }
    }, [organization_id, router]);

    useEffect(() => {
        setIsLoading(true);
        fetchOrgData().finally(() => setIsLoading(false));
    }, [fetchOrgData, organization_id, router]);


    if (isLoading || !organization) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <Skeleton className="h-8 w-1/4"/>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 lg:col-span-1"/>
                    <Skeleton className="h-64 lg:col-span-2"/>
                </div>
                <Skeleton className="h-32 w-full"/>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">
                {organization.name} Settings
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <LogoManagementCard organization={organization} onUpdate={fetchOrgData}/>
                </div>
                <div className="lg:col-span-2">
                    <ProfileDetailsCard organization={organization}/>
                </div>
            </div>

            <DangerZoneCard organization={organization}/>
        </div>
    );
}
'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useOrganization} from '@/providers/OrganizationProvider'; // Import the new hook
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader} from "@/components/Loader";

export default function ManageOrganizationsPage() {
    const {organization, isLoading, error} = useOrganization();
    const router = useRouter();

    useEffect(() => {
        // Once the organization is loaded from the context, redirect to its page
        if (!isLoading && organization) {
            router.push(`/manage/organization/${organization.id}`);
        }
    }, [organization, isLoading, router]);

    // Determine the status message based on the context state
    const getStatusMessage = () => {
        if (error) {
            return `Error: ${error}`;
        }
        if (isLoading) {
            return 'Initializing your workspace, please wait...';
        }
        return 'Redirecting...';
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Organization Setup</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader/>
                        <p className="text-muted-foreground">{getStatusMessage()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

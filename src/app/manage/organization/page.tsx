// app/manage/organizations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api';
import { OrganizationRequest, OrganizationResponse } from '@/types/oraganizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from "@/components/Loader"; // Assuming Loader component exists

export default function ManageOrganizationsPage() {
    const { isAuthenticated, keycloak } = useAuth();
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState('Initializing your workspace...');

    useEffect(() => {
        // Don't run logic until Keycloak is authenticated
        if (!isAuthenticated || !keycloak.tokenParsed) {
            return;
        }

        const setupOrganization = async () => {
            // --- 1. Check for a previously selected organization ---
            const storedOrgId = localStorage.getItem('selectedOrgId');
            if (storedOrgId) {
                setStatusMessage('Redirecting to your organization...');
                router.push(`/manage/organization/${storedOrgId}`);
                return;
            }

            // --- 2. Fetch user's organizations if none is selected ---
            try {
                setStatusMessage('Checking for existing organizations...');
                const organizations = await apiFetch<OrganizationResponse[]>('/event-seating/v1/organizations');

                if (organizations && organizations.length > 0) {
                    const firstOrgId = organizations[0].id;
                    setStatusMessage('Default organization found. Setting it up...');
                    localStorage.setItem('selectedOrgId', firstOrgId);
                    router.push(`/manage/organization/${firstOrgId}`);
                    return;
                }

                // --- 3. Create a default organization if none exist ---
                setStatusMessage('No organization found. Creating a new one for you...');
                const userName = keycloak.tokenParsed?.given_name || 'My';
                const newOrgRequest: OrganizationRequest = { name: `${userName}'s Organization` };

                const newOrg = await apiFetch<OrganizationResponse>('/event-seating/v1/organizations', {
                    method: 'POST',
                    body: JSON.stringify(newOrgRequest),
                });

                setStatusMessage('Workspace created successfully. Redirecting...');
                localStorage.setItem('selectedOrgId', newOrg.id);
                router.push(`/manage/organization/${newOrg.id}`);

            } catch (error) {
                console.error('Failed to set up organization:', error);
                setStatusMessage('An error occurred during setup. Please try refreshing the page.');
            }
        };

        setupOrganization();
    }, [isAuthenticated, keycloak, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Organization Setup</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader />
                        <p className="text-muted-foreground">{statusMessage}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

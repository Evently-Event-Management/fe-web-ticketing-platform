'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useOrganization} from '@/providers/OrganizationProvider';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Loader} from "@/components/Loader";
import {CreateOrganizationDialog} from '@/components/OrganizationDialog';
import {PlusCircle} from 'lucide-react';

export default function ManageOrganizationsPage() {
    const {organization, isLoading} = useOrganization();
    const router = useRouter();

    useEffect(() => {
        // Once the organization is loaded and exists, redirect to its page
        if (!isLoading && organization) {
            router.push(`/manage/organization/${organization.id}`);
        }
    }, [organization, isLoading, router]);

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Organization Setup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <Loader/>
                            <p className="text-muted-foreground">Initializing your workspace...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- No Organization State ---
    // This UI is shown if loading is complete but no organization was found.
    if (!organization && !isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Welcome!</CardTitle>
                        <CardDescription>
                            It looks like you don&#39;t have an organization yet. Let&#39;s create your first one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateOrganizationDialog>
                            <Button size="lg">
                                <PlusCircle className="mr-2 h-5 w-5"/>
                                Create Your First Organization
                            </Button>
                        </CreateOrganizationDialog>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- Redirecting State ---
    // This is shown for a brief moment after loading is done and an organization is found.
    return (
        <div className="flex items-center justify-center h-full bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Organization Setup</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Loader/>
                        <p className="text-muted-foreground">Redirecting to your workspace...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

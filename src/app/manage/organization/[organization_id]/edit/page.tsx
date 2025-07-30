'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {useOrganization} from '@/providers/OrganizationProvider';
import {toast} from 'sonner';
import Image from 'next/image';
import {Building, Upload, Trash2} from 'lucide-react';

import {getOrganizationById} from '@/lib/actions/organizationActions';
import {OrganizationResponse} from '@/types/oraganizations';
import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Skeleton} from '@/components/ui/skeleton';
import {DeleteOrganizationDialog} from '@/components/OrganizationDialog';

export default function OrganizationSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const organization_id = params.organization_id as string;
    const {refreshOrganizations} = useOrganization();

    const {
        updateOrganization,
        uploadLogo,
        removeLogo,
    } = useOrganization();
    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const fetchOrgData = async () => {
            setIsLoading(true);
            try {
                const data = await getOrganizationById(organization_id);
                setOrganization(data);
                setName(data.name);
                setWebsite(data.website || '');
            } catch (error) {
                toast.error("Failed to fetch organization details.");
                console.error("Error fetching organization:", error);
                router.push("/manage/organization");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrgData();
    }, [organization_id, router]);

    const refetchData = async () => {
        const data = await getOrganizationById(organization_id);
        setOrganization(data);
        await refreshOrganizations();
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;
        setIsSubmitting(true);
        toast.promise(updateOrganization(organization.id, {name, website}), {
            loading: 'Saving changes...',
            success: 'Organization details updated successfully!',
            error: (err) => err.message || 'Failed to update details.',
            finally: () => setIsSubmitting(false),
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && organization) {
            toast.promise(uploadLogo(organization.id, file), {
                loading: 'Uploading logo...',
                success: () => {
                    refetchData();
                    return 'Logo uploaded successfully!';
                },
                error: (err) => err.message || 'Failed to upload logo.',
            });
        }
    };

    const handleRemoveLogo = async () => {
        if (!organization) return;
        toast.promise(removeLogo(organization.id), {
            loading: 'Removing logo...',
            success: () => {
                refetchData();
                return 'Logo removed successfully.';
            },
            error: (err) => err.message || 'Failed to remove logo.',
        });
    };

    if (isLoading || !organization) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <Skeleton className="h-8 w-1/4"/>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3"/>
                        <Skeleton className="h-4 w-2/3"/>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24"/>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>

            {/* Profile Details Card */}
            <Card>
                <form onSubmit={handleDetailsSubmit}>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>
                            Update your organization&#39;s name and website.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Logo Management Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization Logo</CardTitle>
                    <CardDescription>
                        Upload or remove your organization&#39;s logo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <div
                            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground overflow-hidden">
                            {organization.logoUrl ? (
                                <Image
                                    src={organization.logoUrl}
                                    alt={`${organization.name} logo`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <Building className="h-10 w-10"/>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button variant="outline" onClick={handleUploadClick}>
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload
                            </Button>
                            {organization.logoUrl && (
                                <Button variant="ghost" className="text-destructive" onClick={handleRemoveLogo}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        These actions are permanent and cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Deleting your organization will remove all associated data, including events, venues, and
                        seating layouts.
                    </p>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
                    <p className="text-sm font-medium">Proceed with extreme caution.</p>
                    <DeleteOrganizationDialog organization={organization}>
                        <Button variant="destructive">Delete this organization</Button>
                    </DeleteOrganizationDialog>
                </CardFooter>
            </Card>
        </div>
    );
}

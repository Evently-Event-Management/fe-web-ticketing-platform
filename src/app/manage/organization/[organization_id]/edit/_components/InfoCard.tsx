import {useOrganization} from "@/providers/OrganizationProvider";
import {OrganizationResponse} from "@/types/oraganizations";
import {useState} from "react";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

interface ProfileDetailsCardProps {
    organization: OrganizationResponse;
}

function ProfileDetailsCard({organization}: ProfileDetailsCardProps) {
    const {updateOrganization} = useOrganization();
    const [name, setName] = useState(organization.name);
    const [website, setWebsite] = useState(organization.website || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            toast.promise(updateOrganization(organization.id, {name, website}), {
                loading: 'Saving changes...',
                success: 'Organization details updated successfully!',
                error: (err) => err.message || 'Failed to update details.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <form onSubmit={handleDetailsSubmit}>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold">Profile Details</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Update your organization&#39;s name and website information.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Organization Name *
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Enter organization name"
                            className="h-10"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website" className="text-sm font-medium">
                            Website
                        </Label>
                        <Input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://example.com"
                            disabled={isSubmitting}
                            className="h-10"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end bg-muted/10 px-6 mt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export {ProfileDetailsCard};
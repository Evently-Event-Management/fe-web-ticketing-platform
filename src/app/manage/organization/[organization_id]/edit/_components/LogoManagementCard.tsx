import {useOrganization} from "@/providers/OrganizationProvider";
import {useRef} from "react";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Building, Trash2, Upload} from "lucide-react";
import {Button} from "@/components/ui/button";
import {OrganizationResponse} from "@/types/oraganizations";
import {Input} from "@/components/ui/input";

interface LogoManagementCardProps {
    organization: OrganizationResponse;
    onUpdate: () => void;
}

function LogoManagementCard({organization, onUpdate}: LogoManagementCardProps) {
    const {uploadLogo, removeLogo} = useOrganization();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic file validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            toast.promise(uploadLogo(organization.id, file), {
                loading: 'Uploading logo...',
                success: () => {
                    onUpdate();
                    return 'Logo uploaded successfully!';
                },
                error: (err) => err.message || 'Failed to upload logo.',
            });
        } finally {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveLogo = async () => {
        toast.promise(removeLogo(organization.id), {
            loading: 'Removing logo...',
            success: () => {
                onUpdate();
                return 'Logo removed successfully.';
            },
            error: (err) => err.message || 'Failed to remove logo.',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Organization Logo</CardTitle>
                <CardDescription>
                    Upload a logo to represent your organization
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6">
                <div className="relative group">
                    <Avatar
                        className="h-24 w-24 ring-2 ring-border ring-offset-2 transition-all group-hover:ring-primary/50">
                        <AvatarImage
                            src={organization.logoUrl || undefined}
                            alt={`${organization.name} logo`}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                            {organization.logoUrl ? (
                                <Building className="h-8 w-8"/>
                            ) : (
                                getInitials(organization.name)
                            )}
                        </AvatarFallback>
                    </Avatar>

                    {/* Optional: Upload overlay on hover */}
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleUploadClick}>
                        <Upload className="h-6 w-6 text-white"/>
                    </div>
                </div>

                <div className="flex flex-col justify-center sm:flex-row items-center gap-3 w-full">
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                    />

                    <Button
                        variant="outline"
                        onClick={handleUploadClick}
                        className="w-full sm:w-auto"
                    >
                        <Upload className="mr-2 h-4 w-4"/>
                        {organization.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>

                    {organization.logoUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                            onClick={handleRemoveLogo}
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Remove
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    Supports PNG, JPG, JPEG, WebP. Max file size: 5MB
                </p>
            </CardContent>
        </Card>
    );
}

export {LogoManagementCard};
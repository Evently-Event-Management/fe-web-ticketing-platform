import * as React from "react";
import {useState} from "react";
import {toast} from "sonner";
import {useOrganization} from "@/providers/OrganizationProvider";
import {OrganizationRequest, OrganizationResponse} from "@/types/oraganizations";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Alert,
    AlertDescription,
    AlertTitle
} from "@/components/ui/alert";
import {AlertTriangle, Loader2 as Loader} from "lucide-react"; // Using a standard lucide loader icon


export function CreateOrganizationDialog({children}: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [website, setWebsite] = useState(''); // ✅ State for the new website field
    const [isLoading, setIsLoading] = useState(false);
    const {createOrganization} = useOrganization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        // ✅ Include website in the request
        const newOrgRequest: OrganizationRequest = {name, website: website.trim() || undefined};

        try {
            const data = await createOrganization(newOrgRequest);
            toast.success(`Organization "${data.name}" created successfully!`);
            setOpen(false);
            setName('');
            setWebsite(''); // Reset website field
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                        Give your new organization a name. Click save when you&#39;re done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Acme Inc."
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {/* ✅ New input field for the website */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="website" className="text-right">
                                Website
                            </Label>
                            <Input
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="col-span-3"
                                placeholder="https://acme.com (optional)"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader className="animate-spin"/>}
                            <span className={isLoading ? 'ml-2' : ''}>
                                {isLoading ? 'Saving...' : 'Save Organization'}
                            </span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteOrganizationDialogProps {
    organization: OrganizationResponse;
    children: React.ReactNode;
    onDelete?: () => void; // Optional callback for additional actions after deletion
}

export function DeleteOrganizationDialog({organization, children, onDelete}: DeleteOrganizationDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {deleteOrganization} = useOrganization();

    const isDeleteDisabled = confirmationName !== organization.name || isLoading;

    const handleDelete = async () => {
        if (isDeleteDisabled) return;

        setIsLoading(true);
        try {
            await deleteOrganization(organization.id);
            toast.success(`Organization "${organization.name}" has been deleted.`);
            setOpen(false);
            setConfirmationName('');
            if (onDelete) {
                onDelete(); // Call the optional callback if provided
            }
        } catch (error) {
            // ✅ Improved error handling consistency
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Organization</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the organization.
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                        <p>
                            All associated data, including
                            <ul className="list-disc pl-5">
                                <li>Events</li>
                                <li>Venues</li>
                                <li>Seating layouts</li>
                            </ul> will be permanently lost.
                        </p>
                    </AlertDescription>
                </Alert>
                <div className="py-4 space-y-2">
                    <Label htmlFor="org-name">
                        Please type <span className="font-bold text-foreground">{organization.name}</span> to confirm.
                    </Label>
                    <Input
                        id="org-name"
                        value={confirmationName}
                        onChange={(e) => setConfirmationName(e.target.value)}
                        placeholder="Organization name"
                        disabled={isLoading}
                    />
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleteDisabled}
                    >
                        {isLoading && <Loader className="animate-spin"/>}
                        <span className={isLoading ? 'ml-2' : ''}>
                            {isLoading ? 'Deleting...' : 'I understand, delete this organization'}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

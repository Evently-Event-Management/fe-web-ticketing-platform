import * as React from "react";
import {useState} from "react";
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
import {AlertTriangle} from "lucide-react";

export function CreateOrganizationDialog({children}: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const {createOrganization, isLoading} = useOrganization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newOrgRequest: OrganizationRequest = {name};
        await createOrganization(newOrgRequest);
        setOpen(false); // Close dialog on success
        setName(''); // Reset form
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
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Organization'}
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
}

export function DeleteOrganizationDialog({organization, children}: DeleteOrganizationDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');
    const {deleteOrganization, isLoading} = useOrganization();

    const isDeleteDisabled = confirmationName !== organization.name || isLoading;

    const handleDelete = async () => {
        if (isDeleteDisabled) return;
        await deleteOrganization(organization.id);
        setOpen(false);
        setConfirmationName('');
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
                    />
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleteDisabled}
                    >
                        {isLoading ? 'Deleting...' : 'I understand, delete this organization'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
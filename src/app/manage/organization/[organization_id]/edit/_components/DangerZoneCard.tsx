import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {DeleteOrganizationDialog} from "@/components/OrganizationDialog";
import {Button} from "@/components/ui/button";
import {OrganizationResponse} from "@/types/oraganizations";

interface DangerZoneProps {
    organization: OrganizationResponse;
    onDelete?: () => void; // Optional callback for after deletion
}

function DangerZoneCard({organization, onDelete}: DangerZoneProps) {
    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                    This action is permanent and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardFooter className="border-t bg-destructive/5 px-6 py-4 flex justify-between items-center">
                <p className="text-sm font-medium">
                    Delete this organization and all its data.
                </p>
                <DeleteOrganizationDialog organization={organization} onDelete={onDelete}>
                    <Button variant="destructive">Delete Organization</Button>
                </DeleteOrganizationDialog>
            </CardFooter>
        </Card>
    );
}

export {DangerZoneCard};
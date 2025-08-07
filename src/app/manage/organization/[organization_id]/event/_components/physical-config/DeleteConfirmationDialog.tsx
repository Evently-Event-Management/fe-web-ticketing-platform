import * as React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    layoutName: string | undefined;
    onConfirmDelete: () => void;
}

export function DeleteConfirmationDialog({
    isOpen,
    onOpenChange,
    layoutName,
    onConfirmDelete
}: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Layout Template</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &#34;{layoutName}&#34;? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { DiscountCodeForm } from "./discount-code-form";
import { DiscountRequest, SessionRequest, TierRequest } from "@/lib/validators/event";
import {createDiscount, DiscountResponse, updateDiscount} from "@/lib/actions/discountActions";
import { toast } from "sonner";

interface DiscountFormDialogProps {
    mode: 'create' | 'edit';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: DiscountResponse;
    eventId: string;
    tiers: TierRequest[];
    sessions: SessionRequest[];
}

export const DiscountFormDialog = ({
                                       mode,
                                       open,
                                       onOpenChange,
                                       onSuccess,
                                       initialData,
                                       eventId,
                                       tiers,
                                       sessions,
                                   }: DiscountFormDialogProps) => {

    const handleSave = async (data: DiscountRequest) => {
        const action = mode === 'create'
            ? createDiscount(eventId, data)
            : updateDiscount(eventId, initialData!.id, data);

        const toastId = toast.loading(`${mode === 'create' ? 'Creating' : 'Updating'} discount...`);

        try {
            await action;
            toast.success(`Discount ${mode === 'create' ? 'created' : 'updated'} successfully.`, { id: toastId });
            onSuccess();
        } catch (error) {
            console.error(`Failed to ${mode} discount`, error);
            toast.error(`Failed to ${mode} discount.`, { id: toastId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Discount' : 'Edit Discount'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your discount code below.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <DiscountCodeForm
                        tiers={tiers}
                        sessions={sessions}
                        onSave={handleSave}
                        isEditing={mode === 'edit'}
                        initialData={initialData}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
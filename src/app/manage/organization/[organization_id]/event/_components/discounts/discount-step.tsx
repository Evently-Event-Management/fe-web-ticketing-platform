'use client';

import { DiscountList } from "./discount-list";
import { useFieldArray, useFormContext } from "react-hook-form";
import {CreateEventFormData, DiscountRequest, discountSchema} from "@/lib/validators/event";
import {useEffect, useState} from "react";
import { FullDiscountFormView } from "./full-discount-form-view";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DiscountStepProps {
    onConfigModeChange?: (isInConfigMode: boolean) => void;
}

export default function DiscountStep({onConfigModeChange}: DiscountStepProps) {
    // ✅ State to manage the view and which discount is being edited
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const { control, watch } = useFormContext<CreateEventFormData>();

    const tiers = watch("tiers");
    const sessions = watch("sessions");

    // ✅ Destructure all necessary functions from useFieldArray
    const { fields: discountFields, append, remove, update } = useFieldArray({
        control,
        name: "discounts",
        keyName: "key"
    });

    useEffect(() => {
        if (onConfigModeChange) {
            onConfigModeChange(view !== 'list');
        }
    }, [onConfigModeChange, view])

    // --- Event Handlers ---

    const handleAddDiscount = (discount: DiscountRequest) => {
        append(discount);
        setView('list');
    }

    // ✅ New handler for updating an existing discount
    const handleUpdateDiscount = (index: number, discount: DiscountRequest) => {
        update(index, discount);
        setView('list');
        setEditingIndex(null);
    }

    // ✅ New handler for deleting a discount
    const handleDeleteDiscount = (index: number) => {
        remove(index);
    }

    // ✅ New handler for toggling the 'isActive' status
    const handleToggleStatus = (index: number) => {
        const discount = discountFields[index];
        update(index, { ...discount, active: !discount.active });
    }

    // ✅ New handler to switch to the edit view
    const handleGoToEditView = (index: number) => {
        setEditingIndex(index);
        setView('edit');
    }

    // --- Conditional Rendering ---

    if (view === 'create' || view === 'edit') {

        const dataToEdit = view === 'edit' && editingIndex !== null
            ? discountSchema.parse(discountFields[editingIndex])
            : undefined;
        return (
            <FullDiscountFormView
                tiers={tiers}
                sessions={sessions}
                onSave={(discount) => {
                    if (view === 'edit' && editingIndex !== null) {
                        handleUpdateDiscount(editingIndex, discount);
                    } else {
                        handleAddDiscount(discount);
                    }
                }}
                onBack={() => setView('list')}
                isEditing={view === 'edit'}
                initialData={view === 'edit' && editingIndex !== null ? dataToEdit : undefined}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Discount Codes</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and manage discount codes for your events.
                    </p>
                </div>
                <Button onClick={() => setView('create')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Discount
                </Button>
            </div>
            <DiscountList
                discounts={discountFields}
                tiers={tiers}
                sessions={sessions}
                onDelete={handleDeleteDiscount}
                onToggleStatus={handleToggleStatus}
                onEdit={handleGoToEditView}
                filters={false}
            />
        </div>
    );
}
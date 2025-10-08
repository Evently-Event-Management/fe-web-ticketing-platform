'use client';

import { DiscountList } from "./discount-list";
import { useFieldArray, useFormContext } from "react-hook-form";
import {CreateEventFormData, DiscountDTO, discountSchema, sessionWithSeatingSchema} from "@/lib/validators/event";
import {useEffect, useState} from "react";
import { FullDiscountFormView } from "./full-discount-form-view";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DiscountStepProps {
    onConfigModeChange?: (isInConfigMode: boolean) => void;
}

export default function DiscountStep({onConfigModeChange}: DiscountStepProps) {
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingDiscount, setEditingDiscount] = useState<DiscountDTO | null>(null);

    const { control, watch } = useFormContext<CreateEventFormData>();

    const tiers = watch("tiers");
    const sessions = watch("sessions");
    const discounts = watch("discounts");

    // Destructure all necessary functions from useFieldArray
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

    const handleAddDiscount = (discount: DiscountDTO) => {
        append(discount);
        setView('list');
    }

    const handleUpdateDiscount = (discount: DiscountDTO) => {
        const index = discountFields.findIndex(item => item.id === discount.id);
        if (index !== -1) {
            update(index, discount);
        }
        setView('list');
        setEditingDiscount(null);
    }

    const handleDeleteDiscount = (id: string) => {
        const index = discountFields.findIndex(item => item.id === id);
        if (index !== -1) {
            remove(index);
        }
    }

    const handleToggleStatus = (id: string) => {
        const index = discountFields.findIndex(item => item.id === id);
        if (index !== -1) {
            const discount = discountFields[index];
            update(index, { ...discount, active: !discount.active });
        }
    }

    const handleGoToEditView = (discount: DiscountDTO) => {
        setEditingDiscount(discount);
        setView('edit');
    }

    // --- Conditional Rendering ---

    if (view === 'create' || view === 'edit') {
        return (
            <FullDiscountFormView
                tiers={tiers}
                sessions={sessions.map((s) => sessionWithSeatingSchema.parse(s))}
                onSave={(discount) => {
                    if (view === 'edit' && editingDiscount) {
                        handleUpdateDiscount(discount);
                    } else {
                        handleAddDiscount(discount);
                    }
                }}
                onBack={() => setView('list')}
                isEditing={view === 'edit'}
                initialData={editingDiscount || undefined}
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
                discounts={discounts?.map((d) => discountSchema.parse(d))}
                tiers={tiers}
                sessions={sessions?.map((s) => sessionWithSeatingSchema.parse(s))}
                onDelete={handleDeleteDiscount}
                onToggleStatus={handleToggleStatus}
                onEdit={handleGoToEditView}
                filters={false}
                isShareable={false}
            />
        </div>
    );
}
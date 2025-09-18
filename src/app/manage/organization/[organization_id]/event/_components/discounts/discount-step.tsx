'use client';

import {
    DiscountCodeForm
} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-code-form";
import { DiscountList } from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-list";
import { useFieldArray, useFormContext } from "react-hook-form";
import {CreateEventFormData, DiscountParsed} from "@/lib/validators/event";

export default function DiscountStep() {
    const { control } = useFormContext<CreateEventFormData>();

    const { fields: tierFields } = useFieldArray({
        control,
        name: "tiers",
    });

    const { fields: sessionFields } = useFieldArray({
        control,
        name: "sessions",
    });

    const { fields: discountFields, append } = useFieldArray({
        control,
        name: "discounts",
    });

    const handleAddDiscount = (discount: DiscountParsed)=> {
        append(discount);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Discount Codes</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and configure discount codes for your events.
                    </p>
                </div>
            </div>
            <DiscountList discounts={discountFields} tiers={tierFields}/>
            <DiscountCodeForm tiers={tierFields} sessions={sessionFields} onSave={handleAddDiscount} />
        </div>
    );
}

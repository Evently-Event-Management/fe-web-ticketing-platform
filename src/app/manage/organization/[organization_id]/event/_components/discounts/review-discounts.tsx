'use client';

import * as React from 'react';
import {CreateEventFormData, DiscountRequest} from '@/lib/validators/event';
import {FieldArrayWithId} from "react-hook-form";
import {DiscountList} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-list";

interface DiscountReviewProps {
    tiers: FieldArrayWithId<CreateEventFormData, "tiers", "id">[],
    sessions?: FieldArrayWithId<CreateEventFormData, "sessions", "id">[],
    discounts?: DiscountRequest[],
}

export const DiscountReview: React.FC<DiscountReviewProps> = ({tiers, sessions, discounts}) => {
    if (tiers.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Discount Codes</h2>
            <DiscountList tiers={tiers} sessions={sessions} discounts={discounts} isReadOnly={true} filters={false}/>
        </div>
    );
};
'use client';

import * as React from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData, finalCreateEventSchema} from '@/lib/validators/event';
import {useOrganization} from '@/providers/OrganizationProvider';
import {ReviewEventHero} from '@/app/manage/_components/review/ReviewEventHero';
import {EventOverview} from '@/app/manage/_components/review/EventOverview';
import {ReviewTicketTiers} from '@/app/manage/_components/review/ReviewTicketTiers';
import {ReviewSessions} from '@/app/manage/_components/review/ReviewSessions';
import {JSX} from "react";
import {Separator} from "@/components/ui/separator";
import {DiscountReview} from "@/app/manage/organization/[organization_id]/event/_components/discounts/review-discounts";

interface ReviewStepProps {
    coverFiles: File[];
}

export function ReviewStep({coverFiles}: ReviewStepProps): JSX.Element {
    const {watch} = useFormContext<CreateEventFormData>();
    const formData = watch();
    const {organization} = useOrganization();

    const validatedFormData = finalCreateEventSchema.safeParse(formData).data;

    if (!validatedFormData) {
        return <div className="text-red-500">Form data is invalid. Please go back and correct the errors.</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold">Event Preview</h2>
                <p className="text-muted-foreground">
                    This is how your event will appear to customers. Review all details before submitting.
                </p>
            </div>

            {/* Hero Section with Cover Photos and Title */}
            <ReviewEventHero
                title={validatedFormData.title}
                categoryName={validatedFormData.categoryName}
                organization={organization}
                coverFiles={coverFiles}
                description={validatedFormData.description}
            />

            <Separator className={'border-3 my-2'}/>

            {/* Event Details Section with Description and Overview */}
            <EventOverview
                overview={validatedFormData.overview}
            />

            <Separator className={'border-3 my-2'}/>

            {/* Tiers & Pricing Section */}
            <ReviewTicketTiers tiers={validatedFormData.tiers}/>

            <Separator className={'border-3 my-2'}/>

            {/* Sessions & Schedule Section */}
            <ReviewSessions sessions={validatedFormData.sessions} tiers={validatedFormData.tiers}/>

            <Separator className={'border-3 my-2'}/>

            <DiscountReview tiers={validatedFormData.tiers} sessions={validatedFormData.sessions} discounts={validatedFormData.discounts}/>
        </div>
    );
}

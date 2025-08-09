'use client';

import * as React from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {
    CoverPhotosCard,
    EventDetailsCard,
    TiersCard,
    SessionsCard
} from './EventReviewCards'; // Assuming these are in a separate file now

// --- Main Review Step Component ---
export function ReviewStep({coverFiles}: { coverFiles: File[] }) {
    const {watch} = useFormContext<CreateEventFormData>();
    const formData = watch(); // Get all form data to pass to the review cards

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Review Your Event</h2>
            <p className="text-muted-foreground">
                This is a preview of how your event information will be structured. Please review all details carefully
                before submitting for approval.
            </p>

            {/* Reusing the modular card components */}
            <CoverPhotosCard items={coverFiles}/>
            <EventDetailsCard details={formData}/>
            <TiersCard tiers={formData.tiers}/>
            <SessionsCard sessions={formData.sessions}/>
        </div>
    );
}

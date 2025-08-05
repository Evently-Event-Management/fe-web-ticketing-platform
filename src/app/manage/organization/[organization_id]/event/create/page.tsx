'use client';

import * as React from 'react';
import {useState} from 'react';
import {CoreDetailsStep} from "@/app/manage/organization/[organization_id]/event/_components/coreDetailsStep";
import {Progress} from "@/components/ui/progress";

// --- Main Wizard Parent Component ---
export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const renderStep = () => {
        switch (step) {
            case 1:
                return <CoreDetailsStep onNextAction={() => setStep(2)}/>;
            // Add cases for other steps here
            default:
                return <CoreDetailsStep onNextAction={() => setStep(2)}/>;
        }
    };

    return (
        // ✅ Reverted to a simpler, top-down layout
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
                <Progress value={(step / totalSteps) * 100} className="mt-2"/>
            </div>

            {renderStep()}
        </div>
    );
}

'use client';

import * as React from 'react';
import {useState} from 'react';
import {CoreDetailsStep} from "@/app/manage/organization/[organization_id]/event/_components/coreDetailsStep";
import {WizardSidebar} from "@/app/manage/organization/[organization_id]/event/_components/WizardSideBar";

// --- Main Wizard Parent Component ---
export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const steps = [
        {number: 1, title: "Core Details", description: "Name, category, and location"},
        {number: 2, title: "Tiers & Pricing", description: "Set your ticket prices"},
        {number: 3, title: "Scheduling", description: "Add dates and times"},
        {number: 4, title: "Seating", description: "Configure seating maps"},
        {number: 5, title: "Review & Publish", description: "Final check before submission"},
    ];

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
        <div className="flex min-h-screen bg-muted/40">
            <WizardSidebar currentStep={step} steps={steps}/>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {renderStep()}
                </div>
            </main>
        </div>
    );
}
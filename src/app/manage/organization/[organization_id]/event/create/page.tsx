'use client';

import * as React from 'react';
import {useState} from 'react';
import {CoreDetailsStep} from "@/app/manage/organization/[organization_id]/event/_components/CoreDetailsStep";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {FormProvider, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {TiersStep} from "@/app/manage/organization/[organization_id]/event/_components/TierStep";
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateEventFormData, createEventSchema, stepValidationFields} from '@/lib/validators/event';


export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const [coverFiles, setCoverFiles] = useState<File[]>([]);
    const totalSteps = 5;

    const methods = useForm<CreateEventFormData>({
        resolver: zodResolver(createEventSchema),
        mode: 'onChange', // Enable real-time validation
        defaultValues: {
            title: 'An Example Event',
            description: 'This is a sample event description.',
            overview: 'An overview of the event goes here.',
            organizationId: '', // Should be set from context/params
            categoryId: '',
            tiers: [],
            sessions: [],
        },
    });

    const onNext = async () => {
        const fieldsToValidate = stepValidationFields[step as keyof typeof stepValidationFields];
        const isValid = await methods.trigger(fieldsToValidate);

        if (isValid) {
            setStep(s => Math.min(totalSteps, s + 1));
        } else {
            // react-hook-form will automatically show errors next to the invalid fields.
            // A toast is good for a general notification.
            toast.error("Please fix the errors before proceeding.");
        }
    };

    const onPrev = () => setStep(s => Math.max(1, s - 1));

    const onSubmit = (data: CreateEventFormData) => {
        console.log("Final Assembled Form Data:", data);
        console.log("Final Cover Files:", coverFiles);
        // Here you would call your createEvent API action
        toast.success("Event submitted for approval!");
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return <CoreDetailsStep coverFiles={coverFiles} setCoverFilesAction={setCoverFiles}/>;
            case 2:
                return <TiersStep/>;
            // Add cases for other steps here
            default:
                return <CoreDetailsStep coverFiles={coverFiles} setCoverFilesAction={setCoverFiles}/>;
        }
    };

    // Helper function to check if current step has errors
    const hasStepErrors = () => {
        const fieldsToCheck = stepValidationFields[step as keyof typeof stepValidationFields];
        if (!fieldsToCheck) return false;

        return fieldsToCheck.some(field => methods.formState.errors[field]);
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Event</h1>
                        <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
                    </div>
                    {hasStepErrors() && (
                        <div className="text-sm text-destructive">
                            ⚠️ Please fix validation errors
                        </div>
                    )}
                </div>
                <Progress value={(step / totalSteps) * 100} className="mt-2"/>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    {renderStep()}

                    <div className="flex justify-between mt-8">
                        <Button type="button" variant="outline" onClick={onPrev} disabled={step === 1}>
                            Previous
                        </Button>
                        {step < totalSteps ? (
                            <Button
                                type="button"
                                onClick={onNext}
                                disabled={methods.formState.isSubmitting}
                            >
                                {methods.formState.isSubmitting ? 'Validating...' : 'Next'}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={methods.formState.isSubmitting}
                            >
                                {methods.formState.isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
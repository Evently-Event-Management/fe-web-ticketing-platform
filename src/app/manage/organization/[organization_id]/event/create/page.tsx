'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {CoreDetailsStep} from "@/app/manage/organization/[organization_id]/event/_components/CoreDetailsStep";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {FormProvider, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {TiersStep} from "@/app/manage/organization/[organization_id]/event/_components/TierStep";
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateEventFormData, createEventSchema, stepValidationFields} from '@/lib/validators/event';
import {SchedulingStep} from "@/app/manage/organization/[organization_id]/event/_components/SchedulingStep";
import {SeatingStep} from "@/app/manage/organization/[organization_id]/event/_components/SeatingStep";
import {useOrganization} from "@/providers/OrganizationProvider";
import {ReviewStep} from "@/app/manage/organization/[organization_id]/event/_components/ReviewStep";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createEvent } from "@/lib/actions/eventActions";
import { useRouter } from "next/navigation";


export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const [coverFiles, setCoverFiles] = useState<File[]>([]);
    const [inConfigMode, setInConfigMode] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        organization: activeOrganization,
    } = useOrganization();
    const totalSteps = 5;

    const methods = useForm<CreateEventFormData>({
        resolver: zodResolver(createEventSchema),
        mode: 'onChange', // Enable real-time validation
        defaultValues: {
            title: 'An Example Event',
            description: 'This is a sample event description.',
            overview: 'An overview of the event goes here.',
            organizationId: activeOrganization?.id || '', // This might be undefined initially
            categoryId: '',
            tiers: [],
            sessions: [],
        },
    });

    // Update organizationId when activeOrganization becomes available
    useEffect(() => {
        if (activeOrganization?.id) {
            methods.setValue('organizationId', activeOrganization.id);
        }
    }, [activeOrganization, methods]);

    const onNext = async () => {
        const fieldsToValidate = stepValidationFields[step as keyof typeof stepValidationFields];
        const isValid = await methods.trigger(fieldsToValidate);
        console.log(methods.watch());

        if (isValid) {
            setStep(s => Math.min(totalSteps, s + 1));
        } else {
            // react-hook-form will automatically show errors next to the invalid fields.
            // A toast is good for a general notification.
            console.log("Validation errors for step", step, methods.formState.errors);
            console.error("Validation failed for step", step);
            toast.error("Please fix the errors before proceeding.");
        }
    };

    const onPrev = () => setStep(s => Math.max(1, s - 1));

    const onSubmit = async (data: CreateEventFormData) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading("Submitting your event...");

        try {
            console.log("Submitting event data:", data);
            console.log("Cover files:", coverFiles);

            // Call the API to create the event
            const response = await createEvent(data, coverFiles);

            toast.dismiss(loadingToast);
            toast.success("Event submitted successfully!");

            console.log("Event created:", response);

            // Navigate to the events page after a short delay
            setTimeout(() => {
                if (activeOrganization?.id) {
                    router.push(`/manage/organization/${activeOrganization.id}/event`);
                }
            }, 1500);

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error creating event:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create event. Please try again.");
        } finally {
            setIsSubmitting(false);
            setShowApprovalDialog(false);
        }
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return <CoreDetailsStep coverFiles={coverFiles} setCoverFilesAction={setCoverFiles}/>;
            case 2:
                return <TiersStep/>;
            // Add cases for other steps here
            case 3:
                return <SchedulingStep/>
            case 4:
                return <SeatingStep onConfigModeChange={setInConfigMode}/>;
            case 5:
                return <ReviewStep coverFiles={coverFiles}/>; // ✅ Render the new step
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
                            Please fix validation errors
                        </div>
                    )}
                </div>
                <Progress value={(step / totalSteps) * 100} className="mt-2"/>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    {renderStep()}

                    {/* Hide the Next/Previous buttons when in configuration mode */}
                    {!inConfigMode && (
                        <div className="flex justify-between mt-8">
                            <Button type="button" variant="outline" onClick={onPrev} disabled={step === 1}>
                                Previous
                            </Button>
                            {step < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={onNext}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Validating...' : 'Next'}
                                </Button>
                            ) : (
                                <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button" disabled={isSubmitting}>
                                            Submit Event
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Event Submission</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Thank you for submitting your event. Our admin team will review your request shortly and get back to you.
                                                You&#39;ll receive a notification once the review is complete.
                                                <br/>
                                                <br/>
                                                <strong>Event Title:</strong> {methods.watch('title')}
                                                <br/>
                                                <strong>Organization:</strong> {activeOrganization?.name || 'N/A'}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogAction
                                                onClick={() => onSubmit(methods.getValues())}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Confirm'}
                                            </AlertDialogAction>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    )}
                </form>
            </FormProvider>
        </div>
    );
}
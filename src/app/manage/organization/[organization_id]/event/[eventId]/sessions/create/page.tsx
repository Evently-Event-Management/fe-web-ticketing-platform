"use client"

import * as React from 'react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, Path, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {Check, ChevronLeft, ChevronRight} from 'lucide-react';
import {Stepper} from '@/components/ui/stepper';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {useEventContext} from '@/providers/EventProvider';
import {createSessions} from '@/lib/actions/sessionActions';
import {
    type CreateEventFormData, finalCreateEventSchema,
    sessionWithSeatingSchema,
    sessionWithVenueSchema, tierSchema
} from '@/lib/validators/event';
import * as z from 'zod';

// Import the steps from the event creation flow
import {SchedulingStep} from '@/app/manage/organization/[organization_id]/event/_components/SchedulingStep';
import {SeatingStep} from '@/app/manage/organization/[organization_id]/event/_components/SeatingStep';

// Form schemas
const sessionFormStepOneSchema = z.object({
    organizationId: z.uuid(),
    tiers: z.array(tierSchema),
    sessions: z.array(sessionWithVenueSchema).min(1, {message: "You must create at least one session."}),
});

const sessionFormStepTwoSchema = sessionFormStepOneSchema.extend({
    organizationId: z.uuid(),
    tiers: z.array(tierSchema),
    sessions: z.array(sessionWithSeatingSchema).min(1, {message: "You must create at least one session."}),
});

const sessionFormSchema = sessionFormStepTwoSchema;

export type CreateSessionsFormData = z.input<typeof sessionFormSchema>;


const getValidationSchemaForStep = (step: number): z.ZodSchema<Partial<CreateEventFormData>> | null => {
    switch (step) {
        case 1:
            return sessionFormStepOneSchema as z.ZodSchema<Partial<CreateSessionsFormData>>
        case 2:
            return sessionFormStepTwoSchema as z.ZodSchema<Partial<CreateSessionsFormData>>
        default:
            return finalCreateEventSchema
    }
}

export default function CreateSessionPage() {
    const [step, setStep] = useState(1);
    const [inConfigMode, setInConfigMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const {event, refetchSessions} = useEventContext();

    const totalSteps = 2; // Scheduling and Seating

    // Provide initial default values that don't depend on `event`.
    const methods = useForm<CreateSessionsFormData>({
        resolver: zodResolver(sessionFormSchema),
        mode: "onChange",
        defaultValues: {
            organizationId: '', // Start with an empty or undefined value
            sessions: [],
            tiers: []
        },
    });

    // --- 2. Use useEffect to update default values when `event` loads ---
    // This is the standard pattern for handling async data in forms.
    useEffect(() => {
        if (event?.organizationId) {
            // `reset` updates the entire form's default values.
            methods.reset({
                organizationId: event.organizationId,
                sessions: [],
                tiers: event.tiers,
            });
        }
    }, [event, methods, methods.reset]); // Dependency array ensures this runs when `event` changes


    // --- 3. The conditional return can now safely happen after all hooks ---
    if (!event) {
        return <div className="p-8">Loading event data...</div>;
    }

    const onNext = async () => {
        const currentSchema = getValidationSchemaForStep(step)
        if (!currentSchema) {
            setStep((s) => Math.min(totalSteps, s + 1))
            return
        }

        const formData = methods.getValues()
        const validationResult = await currentSchema.safeParseAsync(formData)
c
        if (validationResult.success) {
            setStep((s) => Math.min(totalSteps, s + 1))
        } else {
            const {fieldErrors} = validationResult.error.flatten()
            Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
                if (messages) {
                    methods.setError(fieldName as Path<CreateSessionsFormData>, {
                        type: "manual",
                        message: messages.join(", "),
                    })
                    toast.error(messages.join(", "))
                }
            })
            console.error("Validation failed for step", step, fieldErrors)
        }
    }

    const onPrev = () => {
        if (inConfigMode) return; // Don't allow going back while in seating config mode
        setStep((s) => Math.max(1, s - 1));
    };

    const onSubmit = async (data: CreateSessionsFormData) => {
        if (!event?.id) {
            toast.error("Event not found");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Creating sessions...");

        try {
            // Prepare the sessions for submission
            const validationResult = sessionFormSchema.safeParse(data)


            if (!validationResult.success) {
                const {fieldErrors} = validationResult.error.flatten()
                Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
                    if (messages) {
                        methods.setError(fieldName as Path<CreateSessionsFormData>, {
                            type: "manual",
                            message: messages.join(", "),
                        })
                        toast.error(messages.join(", "))
                    }
                })
                throw new Error("Validation failed. Please check the form for errors.")
            }

            // Create the sessions
            const response = await createSessions({
                eventId: event.id,
                sessions: validationResult.data.sessions
            });

            toast.dismiss(loadingToast);
            toast.success(`Successfully created ${response.totalCreated} sessions!`);

            // Refresh sessions in context
            await refetchSessions();

            // Navigate back to sessions list
            setTimeout(() => {
                router.push(`/manage/organization/${event.organizationId}/event/${event.id}/sessions`);
            }, 1500);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error creating sessions:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create sessions. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Custom props for step components that will be needed to make them work independently
    const schedulingStepProps = {
        // Add any props needed for SchedulingStep
        currentSessionCount: event.sessions?.length || 0
    };

    const seatingStepProps = {
        // Pass configuration mode change handler
        onConfigModeChange: setInConfigMode
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <SchedulingStep {...schedulingStepProps} />;
            case 2:
                return <SeatingStep {...seatingStepProps} />;
            default:
                return <SchedulingStep {...schedulingStepProps} />;
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Create New Sessions</h1>
                <p className="text-muted-foreground">
                    Add sessions to your event &#34;{event?.title || 'Event'}&#34;
                </p>
            </div>

            <Stepper
                currentStep={step}
                className="mb-8"
                steps={[
                    {
                        label: "Scheduling",
                        description: "Set dates and locations",
                        icon: <span className="text-xs">1</span>
                    },
                    {
                        label: "Seating",
                        description: "Configure seating layout",
                        icon: <span className="text-xs">2</span>
                    }
                ]}
            />

            <Separator className="mb-8"/>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                    {renderStep()}

                    <Separator/>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting || inConfigMode}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4"/>
                            Cancel
                        </Button>

                        <div className="flex gap-2">
                            {step > 1 && !inConfigMode && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onPrev}
                                    disabled={isSubmitting}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4"/>
                                    Back
                                </Button>
                            )}

                            {step < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={onNext}
                                    disabled={isSubmitting || inConfigMode}
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4"/>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || inConfigMode}
                                    className="bg-primary"
                                >
                                    <Check className="mr-2 h-4 w-4"/>
                                    Create Sessions
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
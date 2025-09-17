"use client"

import * as React from "react"
import {useEffect, useState} from "react"
import {toast} from "sonner"
import {FormProvider, type Path, useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    type CreateEventFormData,
    finalCreateEventSchema,
    step1Schema,
    step2Schema,
    step3Schema, step4Schema,
} from "@/lib/validators/event"
import {useOrganization} from "@/providers/OrganizationProvider"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {createEvent} from "@/lib/actions/eventActions"
import {useRouter} from "next/navigation"
import type {z} from "zod"
import {FileText, Ticket, Calendar, MapPin, Eye, ChevronLeft, ChevronRight, Check} from "lucide-react"
import {CoreDetailsStep} from "@/app/manage/organization/[organization_id]/event/_components/CoreDetailsStep";
import {TiersStep} from "@/app/manage/organization/[organization_id]/event/_components/TierStep";
import {SchedulingStep} from "@/app/manage/organization/[organization_id]/event/_components/SchedulingStep";
import {SeatingStep} from "@/app/manage/organization/[organization_id]/event/_components/SeatingStep";
import {ReviewStep} from "@/app/manage/organization/[organization_id]/event/_components/ReviewStep";
import {WizardProgressBar} from "@/app/manage/organization/[organization_id]/event/_components/WizardProgressBar";
import {Separator} from "@/components/ui/separator";

const getValidationSchemaForStep = (step: number): z.ZodSchema<Partial<CreateEventFormData>> | null => {
    switch (step) {
        case 1:
            return step1Schema
        case 2:
            return step2Schema
        case 3:
            return step3Schema
        case 4:
            return step4Schema
        default:
            return null // No validation needed for the final review step on "Next"
    }
}

const stepConfig = [
    {
        id: 1,
        title: "Event Details",
        description: "Basic information of the event",
        icon: FileText,
    },
    {
        id: 2,
        title: "Ticket Tiers",
        description: "Set up pricing and ticket types",
        icon: Ticket,
    },
    {
        id: 3,
        title: "Scheduling",
        description: "Create sessions and assign venues",
        icon: Calendar,
    },
    {
        id: 4,
        title: "Seating",
        description: "Configure seating maps and capacity",
        icon: MapPin,
    },
    {
        id: 5,
        title: "Review",
        description: "Review and submit your event",
        icon: Eye,
    },
]

export default function CreateEventPage() {
    const [step, setStep] = useState(1)
    const [coverFiles, setCoverFiles] = useState<File[]>([])
    const [inConfigMode, setInConfigMode] = useState(false)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const {organization: activeOrganization} = useOrganization()
    const totalSteps = 5

    const methods = useForm<CreateEventFormData>({
        resolver: zodResolver(finalCreateEventSchema),
        mode: "onChange",
        defaultValues: {
            title: "An Example Event",
            description: "This is a sample event description.",
            overview: "An overview of the event goes here.",
            organizationId: activeOrganization?.id || "",
            categoryId: "",
            tiers: [],
            sessions: [],
        },
    })

    // Update organizationId when activeOrganization becomes available
    useEffect(() => {
        if (activeOrganization?.id) {
            methods.setValue("organizationId", activeOrganization.id)
        }
    }, [activeOrganization, methods])

    const onNext = async () => {
        const currentSchema = getValidationSchemaForStep(step)
        if (!currentSchema) {
            setStep((s) => Math.min(totalSteps, s + 1))
            return
        }

        const formData = methods.getValues()
        const validationResult = await currentSchema.safeParseAsync(formData)

        console.log(validationResult)

        if (validationResult.success) {
            setStep((s) => Math.min(totalSteps, s + 1))
        } else {
            const {fieldErrors} = validationResult.error.flatten()
            Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
                if (messages) {
                    methods.setError(fieldName as Path<CreateEventFormData>, {
                        type: "manual",
                        message: messages.join(", "),
                    })
                    toast.error(messages.join(", "))
                }
            })
            console.error("Validation failed for step", step, fieldErrors)
        }
    }

    const onPrev = () => setStep((s) => Math.max(1, s - 1))

    const onSubmit = async (data: CreateEventFormData) => {
        setIsSubmitting(true)
        const loadingToast = toast.loading("Submitting your event...")

        try {
            // Call the API to create the event
            const response = await createEvent(data, coverFiles)

            toast.dismiss(loadingToast)
            toast.success("Event submitted successfully!")

            console.log("Event created:", response)

            // Navigate to the events page after a short delay
            setTimeout(() => {
                if (activeOrganization?.id) {
                    router.push(`/manage/organization/${activeOrganization.id}/event`)
                }
            }, 1500)
        } catch (error) {
            toast.dismiss(loadingToast)
            console.error("Error creating event:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create event. Please try again.")
        } finally {
            setIsSubmitting(false)
            setShowApprovalDialog(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <CoreDetailsStep coverFiles={coverFiles} setCoverFilesAction={setCoverFiles}/>
            case 2:
                return <TiersStep/>
            case 3:
                return <SchedulingStep/>
            case 4:
                return <SeatingStep onConfigModeChange={setInConfigMode}/>
            case 5:
                return <ReviewStep coverFiles={coverFiles}/>
            default:
                return <CoreDetailsStep coverFiles={coverFiles} setCoverFilesAction={setCoverFiles}/>
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">Create New Event</h1>
                    <p className="text-lg text-muted-foreground">Follow these steps to set up your event perfectly</p>
                </div>

                {/* Replace the progress bar section with the new component */}
                <WizardProgressBar
                    currentStep={step}
                    totalSteps={totalSteps}
                    stepConfig={stepConfig}
                />

                <Separator />

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <div className="min-h-[500px]">{renderStep()}</div>
                        {!inConfigMode && (
                            <div
                                className="flex justify-between items-center mt-12 pt-8 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onPrev}
                                    disabled={step === 1}
                                    className="flex items-center gap-2 px-6 py-3 bg-transparent"
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                    Previous
                                </Button>

                                <div className="flex items-center gap-3">
                                    {step < totalSteps ? (
                                        <Button
                                            type="button"
                                            onClick={onNext}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90"
                                        >
                                            {isSubmitting ? "Validating..." : "Next Step"}
                                            <ChevronRight className="w-4 h-4"/>
                                        </Button>
                                    ) : (
                                        <AlertDialog open={showApprovalDialog}
                                                     onOpenChange={setShowApprovalDialog}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90"
                                                >
                                                    <Check className="w-4 h-4"/>
                                                    Submit Event
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="max-w-md">
                                                <AlertDialogHeader className="text-center">
                                                    <AlertDialogTitle className="text-xl">Ready to
                                                        Submit?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-center space-y-4">
                                                        <p>
                                                            Thank you for creating your event. Our admin team
                                                            will review your request and get
                                                            back to you shortly.
                                                        </p>
                                                        <div
                                                            className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                                                            <div>
                                                                <strong
                                                                    className="text-foreground">Event:</strong> {methods.watch("title")}
                                                            </div>
                                                            <div>
                                                                <strong
                                                                    className="text-foreground">Organization:</strong>{" "}
                                                                {activeOrganization?.name || "N/A"}
                                                            </div>
                                                        </div>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="flex gap-3">
                                                    <AlertDialogCancel
                                                        className="flex-1">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onSubmit(methods.getValues())}
                                                        disabled={isSubmitting}
                                                        className="flex-1 bg-primary hover:bg-primary/90"
                                                    >
                                                        {isSubmitting ? "Submitting..." : "Confirm Submit"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}

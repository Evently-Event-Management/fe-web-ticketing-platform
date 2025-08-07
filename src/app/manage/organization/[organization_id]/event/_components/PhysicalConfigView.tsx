// --- Physical Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {useEffect, useState} from "react";
import {LayoutData, SeatingLayoutTemplateResponse} from "@/types/seatingLayout";
import {
    createSeatingLayoutTemplate,
    deleteSeatingLayoutTemplate,
    getSeatingLayoutTemplatesByOrg,
    updateSeatingLayoutTemplate
} from "@/lib/actions/seatingLayoutTemplateActions";
import {toast} from "sonner";
import {LayoutEditor} from "@/app/manage/organization/[organization_id]/seating/_components/LayoutEditor";
import {Button} from "@/components/ui/button";
import LayoutPreviewCard from "@/app/manage/organization/[organization_id]/seating/_components/LayoutPreviewCard";
import {TierAssignmentEditor} from "@/app/manage/organization/[organization_id]/event/_components/TierAssignmentEditor";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {ArrowLeft, ArrowRight, CheckCircle2} from "lucide-react";
import {cn} from "@/lib/utils";

type Step = {
    id: string;
    label: string;
}

export function PhysicalConfigView({onSave}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const organizationId = watch('organizationId');
    const [templates, setTemplates] = useState<SeatingLayoutTemplateResponse[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'assign'>('select');
    const [selectedLayout, setSelectedLayout] = useState<LayoutData | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [layoutToDelete, setLayoutToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch templates when component loads or organization changes
    useEffect(() => {
        if (organizationId) {
            loadTemplates();
        }
    }, [organizationId]);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await getSeatingLayoutTemplatesByOrg(organizationId, 0, 100);
            setTemplates(res.content);
        } catch (error) {
            toast.error("Failed to load layout templates");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete confirmation - open dialog
    const handleDeleteConfirm = (id: string, name: string) => {
        setLayoutToDelete({id, name});
        setIsDeleteDialogOpen(true);
    };

    // Handle actual deletion
    const handleDeleteLayout = async () => {
        if (!layoutToDelete) return;

        try {
            await deleteSeatingLayoutTemplate(layoutToDelete.id);
            toast.success(`Layout "${layoutToDelete.name}" deleted successfully`);

            // Refresh the templates list
            loadTemplates();

            // If deleted template was selected, clear selection
            if (selectedTemplateId === layoutToDelete.id) {
                setSelectedLayout(null);
                setSelectedTemplateId(null);
            }
        } catch (error) {
            toast.error("Failed to delete layout template");
            console.error(error);
        } finally {
            setIsDeleteDialogOpen(false);
            setLayoutToDelete(null);
        }
    };

    const handleTierAssignmentSave = (layoutWithTiers: SessionSeatingMapRequest) => {
        // Check if all seats and standing blocks have tier assignments
        let hasUnassignedElements = false;

        for (const block of layoutWithTiers.layout.blocks) {
            // Check seated blocks (rows with seats)
            if (block.type === 'seated_grid' && block.rows) {
                for (const row of block.rows) {
                    for (const seat of row.seats) {
                        // Seat must either have a tierId or be marked as RESERVED
                        if (!seat.tierId && seat.status !== 'RESERVED') {
                            hasUnassignedElements = true;
                            break;
                        }
                    }
                    if (hasUnassignedElements) break;
                }
            }

            // Check standing capacity blocks
            if (block.type === 'standing_capacity' && block.seats) {
                // For standing blocks, check if at least one seat has a tier assignment
                const hasAnyAssignedSeat = block.seats.some(seat => seat.tierId);
                if (!hasAnyAssignedSeat && block.seats.length > 0) {
                    hasUnassignedElements = true;
                    break;
                }
            }

            if (hasUnassignedElements) break;
        }

        if (hasUnassignedElements) {
            toast.error("Please assign all seats to a tier or mark them as reserved. Standing areas must also have tier assignments.");
            return;
        }

        // All elements are properly assigned, proceed with save
        onSave(layoutWithTiers);
    };

    const handleSave = async (layoutData: LayoutData) => {
        const request = {
            name: layoutData.name,
            organizationId,
            layoutData,
        };

        // If we're editing an existing template, update it instead of creating a new one
        if (selectedTemplateId) {
            toast.promise(updateSeatingLayoutTemplate(selectedTemplateId, request), {
                loading: 'Updating layout...',
                success: (data) => {
                    // Proceed to assign mode with updated layout data
                    setSelectedLayout(data.layoutData);
                    setMode("assign");
                    return `Layout "${data.name}" updated successfully!`;
                },
                error: (err) => err.message || 'Failed to update layout.',
            });
        } else {
            // Creating a new template from scratch
            toast.promise(createSeatingLayoutTemplate(request), {
                loading: 'Saving new layout...',
                success: (data) => {
                    // Proceed to assign mode with the new layout
                    setSelectedLayout(data.layoutData);
                    setSelectedTemplateId(data.id);
                    setMode("assign");
                    return `Layout "${data.name}" saved successfully!`;
                },
                error: (err) => err.message || 'Failed to create layout.',
            });
        }
    };

    // Navigation between steps
    const goToPrevStep = () => {
        if (mode === 'create') {
            setMode('select');
        } else if (mode === 'assign') {
            setMode('create');
        }
    };

    const goToNextStep = () => {
        if (mode === 'select') {
            if (!selectedLayout) {
                toast.error("Please select a layout first");
                return;
            }
            setMode('create');
        } else if (mode === 'create') {
            setMode('assign');
        }
    };

    // Progress steps configuration
    const steps: Step[] = [
        {id: 'select', label: 'Select Layout'},
        {id: 'create', label: 'Edit Layout'},
        {id: 'assign', label: 'Assign Tiers'},
    ];

    // Render progress steps indicator with clickable steps for navigation
    const renderProgressSteps = () => (
        <div className="mb-6">
            <div className="flex items-center justify-center">
                {steps.map((step, idx) => {
                    // Determine if this step is clickable (can't skip ahead, but can go back)
                    const currentStepIndex = steps.findIndex(s => s.id === mode);
                    const isClickable = idx <= currentStepIndex;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step indicator */}
                            <div
                                className={cn(
                                    "flex flex-col items-center",
                                    isClickable && "cursor-pointer"
                                )}
                                onClick={() => {
                                    if (!isClickable) return;
                                    setMode(step.id as 'select' | 'create' | 'assign');
                                }}
                            >
                                <div
                                    className={cn(
                                        "flex items-center justify-center h-8 w-8 rounded-full border-2",
                                        mode === step.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : idx < steps.findIndex(s => s.id === mode)
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-muted-foreground text-muted-foreground"
                                    )}
                                >
                                    {idx < steps.findIndex(s => s.id === mode) ? (
                                        <CheckCircle2 className="h-5 w-5"/>
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-xs mt-1",
                                    mode === step.id ? "text-primary font-medium" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line between steps */}
                            {idx < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "w-12 h-[2px] mx-1",
                                        idx < steps.findIndex(s => s.id === mode)
                                            ? "bg-primary"
                                            : "bg-muted-foreground/30"
                                    )}
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    );

    // Navigation buttons
    const renderNavigationButtons = () => (
        <div className="flex justify-between mt-4">
            {mode !== 'select' && (
                <Button
                    variant="outline"
                    type={'button'}
                    onClick={goToPrevStep}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                </Button>
            )}

            {mode !== 'assign' && (
                <Button
                    type={"button"}
                    onClick={goToNextStep}
                    className="flex items-center gap-2 ml-auto"
                    disabled={mode === 'select' && !selectedLayout}
                >
                    Next
                    <ArrowRight className="w-4 h-4"/>
                </Button>
            )}
        </div>
    );

    if (mode === 'create') {
        return (
            <>
                {renderProgressSteps()}
                <div className={"h-[70vh] ring-1 ring-primary rounded-lg overflow-hidden"}>
                    <LayoutEditor
                        onSave={handleSave}
                        initialData={selectedLayout ?? undefined}
                    />
                </div>
                {renderNavigationButtons()}
            </>
        );
    }

    if (mode === 'assign' && selectedLayout) {
        return (
            <>
                {renderProgressSteps()}
                <TierAssignmentEditor initialLayout={selectedLayout} onSave={handleTierAssignmentSave}/>
                {renderNavigationButtons()}
            </>
        );
    }

    return (
        <>
            {renderProgressSteps()}
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Select a Seating Layout</h3>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedLayout(null);
                            setSelectedTemplateId(null);
                            setMode('create');
                        }}
                    >
                        Create From Scratch
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading layouts...</div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No seating layouts found</p>
                        <p className="mt-2">Create your first layout to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className={cn(
                                    "cursor-pointer",
                                    selectedTemplateId === template.id && "ring-2 ring-primary rounded-md"
                                )}
                                onClick={() => {
                                    setSelectedLayout(template.layoutData);
                                    setSelectedTemplateId(template.id);
                                    // Immediately move to the create step when a layout is selected
                                    setMode('create');
                                }}
                            >
                                <LayoutPreviewCard
                                    layout={template}
                                    onDelete={handleDeleteConfirm}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {renderNavigationButtons()}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Layout Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &#34;{layoutToDelete?.name}&#34;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteLayout}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
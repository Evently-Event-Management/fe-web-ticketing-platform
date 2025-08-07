// --- Physical Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {useEffect, useState} from "react";
import {LayoutData, SeatingLayoutTemplateResponse} from "@/types/seatingLayout";
import {
    createSeatingLayoutTemplate,
    getSeatingLayoutTemplatesByOrg,
    updateSeatingLayoutTemplate
} from "@/lib/actions/seatingLayoutTemplateActions";
import {toast} from "sonner";
import {LayoutEditor} from "@/app/manage/organization/[organization_id]/seating/_components/LayoutEditor";
import {Button} from "@/components/ui/button";
import LayoutPreviewCard from "@/app/manage/organization/[organization_id]/seating/_components/LayoutPreviewCard";
import {TierAssignmentEditor} from "@/app/manage/organization/[organization_id]/event/_components/TierAssignmentEditor";
import {CheckCircle2} from "lucide-react";
import {cn} from "@/lib/utils";

export function PhysicalConfigView({onSave}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const organizationId = watch('organizationId');
    console.log("Organization ID:", organizationId);
    const [templates, setTemplates] = useState<SeatingLayoutTemplateResponse[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'assign'>('select');
    const [selectedLayout, setSelectedLayout] = useState<LayoutData | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    useEffect(() => {
        if (organizationId) {
            getSeatingLayoutTemplatesByOrg(organizationId, 0, 100).then(res => setTemplates(res.content));
        }
    }, [organizationId]);

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

    // Progress steps configuration
    const steps = [
        {id: 'select', label: 'Select Layout'},
        {id: 'create', label: 'Edit Layout'},
        {id: 'assign', label: 'Assign Tiers'},
    ];

    // Render progress steps indicator
    const renderProgressSteps = () => (
        <div className="mb-6">
            <div className="flex items-center justify-center">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
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
                ))}
            </div>
        </div>
    );

    if (mode === 'create') {
        return (
            <>
                {renderProgressSteps()}
                <div className={"h-[80vh] ring-1 ring-primary rounded-lg overflow-hidden"}>
                    <LayoutEditor
                        onSave={handleSave}
                        initialData={selectedLayout ?? undefined}
                    />
                </div>
            </>
        );
    }

    if (mode === 'assign' && selectedLayout) {
        return (
            <>
                {renderProgressSteps()}
                <TierAssignmentEditor initialLayout={selectedLayout} onSave={handleTierAssignmentSave}/>
            </>
        );
    }

    return (
        <>
            {renderProgressSteps()}
            <div className="p-4">
                <h3 className="font-semibold mb-4">Select a Seating Layout</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {templates.map(template => (
                        <div key={template.id} onClick={() => {
                            setSelectedLayout(template.layoutData);
                            setSelectedTemplateId(template.id);
                            setMode('create');
                        }}>
                            <LayoutPreviewCard layout={template} onDelete={() => {
                            }}/>
                        </div>
                    ))}
                </div>
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
        </>
    );
}
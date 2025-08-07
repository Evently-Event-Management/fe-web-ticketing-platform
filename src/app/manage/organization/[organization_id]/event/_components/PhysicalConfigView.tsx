// --- Physical Configuration View ---
import {Block, CreateEventFormData, Row, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {LayoutData, SeatingLayoutTemplateResponse} from "@/types/seatingLayout";
import {
    createSeatingLayoutTemplate,
    deleteSeatingLayoutTemplate,
    getSeatingLayoutTemplatesByOrg,
    updateSeatingLayoutTemplate
} from "@/lib/actions/seatingLayoutTemplateActions";
import {toast} from "sonner";
import {LayoutEditor} from "@/app/manage/organization/[organization_id]/seating/_components/LayoutEditor";
import {TierAssignmentEditor} from "@/app/manage/organization/[organization_id]/event/_components/TierAssignmentEditor";
import {ProgressSteps} from "./physical-config/ProgressSteps";
import {NavigationButtons} from "./physical-config/NavigationButtons";
import {LayoutSelector} from "./physical-config/LayoutSelector";
import {DeleteConfirmationDialog} from "./physical-config/DeleteConfirmationDialog";
import {getRowLabel} from "@/app/manage/organization/[organization_id]/seating/create/_lib/getRowLabel";

type Step = {
    id: string;
    label: string;
}

export function PhysicalConfigView({onSave}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const organizationId = watch('organizationId');
    const tiers = watch('tiers');
    const [templates, setTemplates] = useState<SeatingLayoutTemplateResponse[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'assign'>('select');
    const [selectedLayout, setSelectedLayout] = useState<LayoutData | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [layoutToDelete, setLayoutToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentAssignedLayout, setCurrentAssignedLayout] = useState<SessionSeatingMapRequest | null>(null);

    // Progress steps configuration
    const steps: Step[] = [
        {id: 'select', label: 'Select Layout'},
        {id: 'create', label: 'Edit Layout'},
        {id: 'assign', label: 'Assign Tiers'},
    ];

    const loadTemplates = useCallback(async () => {
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
    }, [organizationId]);

    // Fetch templates when component loads or organization changes
    useEffect(() => {
        if (organizationId) {
            loadTemplates().then();
        }
    }, [loadTemplates, organizationId]);

    // Transform layout for tier assignment when selectedLayout changes
    useEffect(() => {
        if (!selectedLayout || mode !== 'assign') return;

        const transformedBlocks = selectedLayout.layout.blocks.map((block) => {
            const newBlock: Block = {
                ...block,
                rows: [],
                seats: [],
            };

            if (block.type === 'seated_grid' && block.rows && block.columns) {
                const startRowIndex = block.startRowLabel ? block.startRowLabel.charCodeAt(0) - 'A'.charCodeAt(0) : 0;
                const startCol = block.startColumnLabel || 1;
                const numRows = block.rows;
                const numColumns = block.columns;

                newBlock.rows = Array.from({length: numRows}, (_, rowIndex) => {
                    const newRow: Row = {
                        id: `temp_row_${block.id}_${rowIndex}`,
                        label: `${getRowLabel(startRowIndex + rowIndex)}`,
                        seats: Array.from({length: numColumns}, (_, colIndex) => ({
                            id: `temp_seat_${block.id}_${rowIndex}_${colIndex}`,
                            label: `${startCol + colIndex}${getRowLabel(startRowIndex + rowIndex)}`,
                            status: 'AVAILABLE',
                        })),
                    };
                    return newRow;
                });
            } else if (block.type === 'standing_capacity' && block.capacity) {
                const capacity = block.capacity;
                newBlock.seats = Array.from({length: capacity}, (_, i) => ({
                    id: `temp_seat_${block.id}_${i}`,
                    label: `Slot ${i + 1}`,
                    status: 'AVAILABLE',
                }));
            }
            return newBlock;
        });

        setCurrentAssignedLayout({
            name: selectedLayout.name,
            layout: {
                blocks: transformedBlocks,
            },
        });
    }, [selectedLayout, mode]);

    // Handle step navigation
    const handleStepClick = (stepId: string) => {
        setMode(stepId as 'select' | 'create' | 'assign');
    };

    // Handle layout selection
    const handleLayoutSelect = (template: SeatingLayoutTemplateResponse) => {
        setSelectedLayout(template.layoutData);
        setSelectedTemplateId(template.id);
    };

    // Handle create from scratch
    const handleCreateFromScratch = () => {
        setSelectedLayout(null);
        setSelectedTemplateId(null);
        setMode('create');
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
            await loadTemplates();

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

    // Handle tier assignments updates from the editor
    const handleTierAssignmentUpdate = (layoutWithTiers: SessionSeatingMapRequest) => {
        setCurrentAssignedLayout(layoutWithTiers);
    };

    const handleTierAssignmentSave = () => {
        if (!currentAssignedLayout) {
            toast.error("No layout data available");
            return;
        }

        // Check if all seats and standing blocks have tier assignments
        let hasUnassignedElements = false;

        for (const block of currentAssignedLayout.layout.blocks) {
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
        onSave(currentAssignedLayout);
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

    // Render different steps based on current mode
    const renderCurrentStep = () => {
        switch (mode) {
            case 'create':
                return (
                    <div className={"h-[70vh] ring-1 ring-primary rounded-lg overflow-hidden"}>
                        <LayoutEditor
                            onSave={handleSave}
                            initialData={selectedLayout ?? undefined}
                        />
                    </div>
                );
            case 'assign':
                return currentAssignedLayout ? (
                    <TierAssignmentEditor
                        layoutData={currentAssignedLayout}
                        onChange={handleTierAssignmentUpdate}
                        tiers={tiers}
                    />
                ) : (
                    <div className="p-4 text-center">Loading tier assignment editor...</div>
                );
            case 'select':
            default:
                return (
                    <LayoutSelector
                        templates={templates}
                        selectedTemplateId={selectedTemplateId}
                        isLoading={isLoading}
                        onLayoutSelect={handleLayoutSelect}
                        onCreateFromScratch={handleCreateFromScratch}
                        onDeleteLayout={handleDeleteConfirm}
                    />
                );
        }
    };

    return (
        <>
            <ProgressSteps
                steps={steps}
                currentMode={mode}
                onStepClick={handleStepClick}
            />

            {renderCurrentStep()}

            <NavigationButtons
                currentMode={mode}
                canProgress={!!selectedLayout}
                onPrevious={goToPrevStep}
                onNext={goToNextStep}
                onFinish={handleTierAssignmentSave}
            />

            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                layoutName={layoutToDelete?.name}
                onConfirmDelete={handleDeleteLayout}
            />
        </>
    );
}

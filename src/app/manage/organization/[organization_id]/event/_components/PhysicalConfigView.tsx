// --- Physical Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest, Block, Seat} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {useEffect, useState} from "react";
import {LayoutData, SeatingLayoutTemplateResponse} from "@/types/seatingLayout";
import {createSeatingLayoutTemplate, getSeatingLayoutTemplatesByOrg} from "@/lib/actions/seatingLayoutTemplateActions";
import {toast} from "sonner";
import {LayoutEditor} from "@/app/manage/organization/[organization_id]/seating/_components/LayoutEditor";
import {Button} from "@/components/ui/button";
import LayoutPreviewCard from "@/app/manage/organization/[organization_id]/seating/_components/LayoutPreviewCard";
import {TierAssignmentEditor} from "@/app/manage/organization/[organization_id]/event/_components/TierAssignmentEditor";

export function PhysicalConfigView({onSave}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const organizationId = watch('organizationId');
    console.log("Organization ID:", organizationId);
    const [templates, setTemplates] = useState<SeatingLayoutTemplateResponse[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'assign'>('select');
    const [selectedLayout, setSelectedLayout] = useState<LayoutData | null>(null);

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

        toast.promise(createSeatingLayoutTemplate(request), {
            loading: 'Saving new layout...',
            success: (data) => {
                // Redirect to the new edit page on success
                return `Layout "${data.name}" saved successfully!`;
            },
            error: (err) => (err.message || 'Failed to create layout.') + 'Moving to assign mode.',
        });
    };


    if (mode === 'create') {
        return <LayoutEditor onSave={async (data) => {
            await handleSave(data);
            setSelectedLayout(data);
            setMode("assign");
        }} initialData={selectedLayout ?? undefined}/>;
    }

    if (mode === 'assign' && selectedLayout) {
        return <TierAssignmentEditor initialLayout={selectedLayout} onSave={handleTierAssignmentSave}/>;
    }

    return (
        <div className="p-4">
            <h3 className="font-semibold mb-4">Select a Seating Layout</h3>
            <div className="grid grid-cols-5 gap-4 mb-4">
                {templates.map(template => (
                    <div key={template.id} onClick={() => {
                        setSelectedLayout(template.layoutData);
                        setMode('create');
                    }}>
                        <LayoutPreviewCard layout={template} onDelete={() => {
                        }}/>
                    </div>
                ))}
            </div>
            <Button variant="outline" onClick={() => setMode('create')}>Create From Scratch</Button>
        </div>
    );
}
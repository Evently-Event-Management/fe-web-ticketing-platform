// --- Physical Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest} from "@/lib/validators/event";
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

export function PhysicalConfigView({sessionIndex, onSave}: {
    sessionIndex: number;
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


    // This is a simplified tier assignment step. A real implementation would be more visual.
    const handleTierAssignment = (layout: SessionSeatingMapRequest) => {
        // Here you would open a more complex editor to assign tiers to the layout's seats/blocks.
        // For this example, we'll just accept the layout as is.
        onSave(layout);
    };
    const handleTierAssignmentSave = (layoutWithTiers: SessionSeatingMapRequest) => {
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
                return `Layout "${data.name}" created successfully!`;
            },
            error: (err) => (err.message || 'Failed to create layout.') + 'Moving to assign mode.',
        });
    };


    if (mode === 'create') {
        return <LayoutEditor onSave={async (data) => {
            await handleSave(data);
            setMode('assign');
            setSelectedLayout(data);
        }}/>;
    }

    if (mode === 'assign' && selectedLayout) {
        return <TierAssignmentEditor initialLayout={selectedLayout} onSave={handleTierAssignmentSave} />;
    }

    return (
        <div className="p-4">
            <h3 className="font-semibold mb-4">Select a Seating Layout</h3>
            <div className="grid grid-cols-5 gap-4 mb-4">
                {templates.map(template => (
                    <div key={template.id} onClick={() => {
                        setSelectedLayout(template.layoutData);
                        setMode('assign');
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
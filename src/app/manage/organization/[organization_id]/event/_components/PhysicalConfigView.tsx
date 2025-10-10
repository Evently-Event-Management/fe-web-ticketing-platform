// --- Physical Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {PhysicalLayoutEditorBase} from "@/app/manage/organization/[organization_id]/event/_components/PhysicalLayoutEditorBase";

export function PhysicalConfigView({onSave, initialConfig}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
    initialConfig?: SessionSeatingMapRequest;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const organizationId = watch('organizationId');
    const tiers = watch('tiers');

    return (
        <PhysicalLayoutEditorBase
            onSave={onSave}
            initialConfig={initialConfig}
            tiers={tiers}
            organizationId={organizationId}
        />
    );
}

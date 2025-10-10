// --- Physical Configuration View ---
import {SessionSeatingMapRequest, TierDTO} from "@/lib/validators/event";
import * as React from "react";
import {PhysicalLayoutEditorBase} from "@/app/manage/organization/[organization_id]/event/_components/PhysicalLayoutEditorBase";

export function PhysicalLayoutEditor({onSave, initialConfig, tiers, organizationId}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
    tiers: TierDTO[];
    organizationId: string;
    initialConfig?: SessionSeatingMapRequest;
}) {
    return (
        <PhysicalLayoutEditorBase
            onSave={onSave}
            initialConfig={initialConfig}
            tiers={tiers}
            organizationId={organizationId}
        />
    );
}

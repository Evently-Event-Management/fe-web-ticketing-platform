// --- Online Configuration Editor ---
import {SessionSeatingMapRequest, TierDTO} from "@/lib/validators/event";
import * as React from "react";
import {OnlineConfigEditorBase} from "@/app/manage/organization/[organization_id]/event/_components/OnlineConfigEditorBase";

export function OnlineLayoutEditor({onSave, initialConfig, tiers}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
    tiers: TierDTO[];
    initialConfig?: SessionSeatingMapRequest;
}) {
    return (
        <OnlineConfigEditorBase
            onSave={onSave}
            tiers={tiers}
            initialConfig={initialConfig}
        />
    );
}

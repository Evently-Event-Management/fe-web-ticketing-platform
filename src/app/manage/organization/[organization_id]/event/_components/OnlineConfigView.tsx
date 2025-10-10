// --- Online Configuration View ---
import {CreateEventFormData, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {OnlineConfigEditorBase} from "@/app/manage/organization/[organization_id]/event/_components/OnlineConfigEditorBase";

export function OnlineConfigView({onSave, initialConfig}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
    initialConfig?: SessionSeatingMapRequest;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const tiers = watch('tiers');

    return (
        <OnlineConfigEditorBase
            onSave={onSave}
            tiers={tiers}
            initialConfig={initialConfig}
        />
    );
}
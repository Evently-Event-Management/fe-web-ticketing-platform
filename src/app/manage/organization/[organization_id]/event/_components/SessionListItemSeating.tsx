// --- Session List Item ---
import {useFormContext} from "react-hook-form";
import {CreateEventFormData} from "@/lib/validators/event";
import {AlertCircle, Armchair, Users} from "lucide-react";
import {format, parseISO} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import * as React from "react";

export function SessionListItemSeating({field, index, onConfigure}: {
    field: any;
    index: number;
    onConfigure: () => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const {isOnline, layoutData} = watch(`sessions.${index}`);

    const isConfigured = layoutData && layoutData.layout.blocks.length > 0;
    const badgeVariant = isConfigured ? "default" : "destructive";
    const badgeText = isConfigured ? "Seating Set" : (isOnline ? "Capacity Not Set" : "Layout Not Set");

    return (
        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {isOnline ? <Users className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                </div>
                <div>
                    <p className="font-medium">Session {index + 1} <span
                        className="text-xs text-muted-foreground">({isOnline ? 'Online' : 'Physical'})</span></p>
                    <p className="text-sm text-muted-foreground">
                        {format(parseISO(field.startTime), "PPP p")}
                    </p>
                </div>
                <Badge variant={badgeVariant}>
                    {!isConfigured && <AlertCircle className="mr-1 h-3 w-3"/>}
                    {badgeText}
                </Badge>
            </div>
            <Button type="button" variant="outline" onClick={onConfigure}>
                Configure Seating
            </Button>
        </div>
    );
}
// --- Session List Item ---
import {useFormContext} from "react-hook-form";
import {CreateEventFormData, SessionFormData, SessionType} from "@/lib/validators/event";
import {AlertCircle, Armchair, Info, Users} from "lucide-react";
import {format, parseISO} from "date-fns";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function SessionListItemSeating({field, index, onConfigure}: {
    field: SessionFormData;
    index: number;
    onConfigure: () => void;
}) {
    const {watch} = useFormContext<CreateEventFormData>();
    const {sessionType, layoutData} = watch(`sessions.${index}`);
    const isOnline = sessionType === SessionType.ONLINE;

    const isConfigured = layoutData && layoutData.layout.blocks.length > 0;
    const badgeVariant = isConfigured ? "default" : "destructive";
    const badgeText = isConfigured ? "Seating Set" : (isOnline ? "Capacity Not Set" : "Layout Not Set");

    // Calculate metadata to display
    const getLayoutMetadata = () => {
        if (!isConfigured) return null;

        if (isOnline) {
            // For online events, show total capacity from blocks
            const totalCapacity = layoutData.layout.blocks.reduce((sum, block) => {
                return sum + (block.capacity || 0);
            }, 0);
            return totalCapacity > 0 ? `Capacity: ${totalCapacity}` : null;
        } else {
            // For physical events, show layout name and total seats
            const layoutName = layoutData.name;
            const totalSeats = layoutData.layout.blocks.reduce((sum, block) => {
                if (block.rows && block.rows.length > 0) {
                    return sum + block.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0);
                } else if (block.capacity) {
                    // For standing blocks, use capacity
                    return sum + block.capacity;
                } else if (block.seats) {
                    return sum + (block.seats?.length || 0)
                }
                return sum;
            }, 0);

            return (
                <>
                    {layoutName && <div>Layout: {layoutName} •</div>}
                    <div>Total capacity: {totalSeats}</div>
                </>
            );
        }
    };

    const metadata = getLayoutMetadata();

    return (
        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {isOnline ? <Users className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                </div>
                <div className="space-y-1">
                    <p className="font-medium">Session {index + 1} <span
                        className="text-xs text-muted-foreground">({isOnline ? 'Online' : 'Physical'})</span></p>
                    <p className="text-sm text-muted-foreground">
                        {format(parseISO(field.startTime), "PPP p")}
                    </p>
                    {isConfigured && metadata && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Info className="h-3 w-3"/>
                            {metadata}
                        </div>
                    )}
                </div>
                <Badge variant={badgeVariant}>
                    {!isConfigured && <AlertCircle className="mr-1 h-3 w-3"/>}
                    {badgeText}
                </Badge>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="outline" onClick={onConfigure}>
                            {isConfigured ? "Edit Configuration" : "Configure Seating"}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isConfigured ? "Modify the existing seating layout" : "Set up seating or capacity"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
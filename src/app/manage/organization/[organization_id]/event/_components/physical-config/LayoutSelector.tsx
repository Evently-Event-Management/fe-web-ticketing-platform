import * as React from "react";
import {Button} from "@/components/ui/button";
import {SeatingLayoutTemplateResponse} from "@/types/seatingLayout";
import LayoutPreviewCard from "@/app/manage/organization/[organization_id]/seating/_components/LayoutPreviewCard";
import {cn} from "@/lib/utils";

interface LayoutSelectorProps {
    templates: SeatingLayoutTemplateResponse[];
    selectedTemplateId: string | null;
    isLoading: boolean;
    onLayoutSelect: (template: SeatingLayoutTemplateResponse) => void;
    onCreateFromScratch: () => void;
    onDeleteLayout: (id: string, name: string) => void;
}

export function LayoutSelector({
    templates,
    selectedTemplateId,
    isLoading,
    onLayoutSelect,
    onCreateFromScratch,
    onDeleteLayout
}: LayoutSelectorProps) {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Select a Seating Layout</h3>
                <Button
                    variant="outline"
                    onClick={onCreateFromScratch}
                >
                    Create From Scratch
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading layouts...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No seating layouts found</p>
                    <p className="mt-2">Create your first layout to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            className={cn(
                                "cursor-pointer",
                                selectedTemplateId === template.id && "ring-2 ring-primary rounded-md"
                            )}
                            onClick={() => onLayoutSelect(template)}
                        >
                            <LayoutPreviewCard
                                layout={template}
                                onDelete={onDeleteLayout}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

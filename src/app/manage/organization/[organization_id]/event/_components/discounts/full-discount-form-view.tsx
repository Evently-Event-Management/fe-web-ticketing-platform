"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { DiscountCodeForm } from "./discount-code-form"
import { DiscountParsed, SessionParsed, TierParsed} from "@/lib/validators/event";

interface FullDiscountFormViewProps {
    tiers: TierParsed[],
    sessions: SessionParsed[],
    onSave: (discount: DiscountParsed) => void,
    onBack: () => void,
    isEditing?: boolean,
    initialData?: DiscountParsed,
}
export function FullDiscountFormView({ tiers, sessions, onSave, onBack, isEditing, initialData }: FullDiscountFormViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">{isEditing ? "Edit" : "Create New"} Discount Code</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure all the details for your discount code.
                    </p>
                </div>
            </div>
            <DiscountCodeForm
                tiers={tiers}
                sessions={sessions}
                onSave={onSave}
                isQuickCreate={false}
                isEditing={isEditing}
                initialData={initialData}
            />
        </div>
    )
}
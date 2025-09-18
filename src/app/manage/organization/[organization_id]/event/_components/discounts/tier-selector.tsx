"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket } from "lucide-react"
import {CreateEventFormData} from "@/lib/validators/event";
import {FieldArrayWithId} from "react-hook-form";

interface TierSelectorProps {
    tiers: FieldArrayWithId<CreateEventFormData, "tiers", "id">[]
    selectedTiers: string[]
    onSelectionChange: (selectedTiers: string[]) => void
}

export function TierSelector({ tiers, selectedTiers = [], onSelectionChange }: TierSelectorProps) {
    const handleTierToggle = (tierId: string) => {
        const newSelection = selectedTiers.includes(tierId)
            ? selectedTiers.filter((id) => id !== tierId)
            : [...selectedTiers, tierId]
        onSelectionChange(newSelection)
    }

    const selectAll = () => {
        onSelectionChange(tiers.map((tier) => tier.id))
    }

    const selectNone = () => {
        onSelectionChange([])
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Applicable Tiers
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" type={'button'} size="sm" onClick={selectAll}>
                            Select All
                        </Button>
                        <Button variant="outline"  type={'button'} size="sm" onClick={selectNone}>
                            Select None
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                            <Checkbox
                                id={`tier-${tier.id}`}
                                checked={selectedTiers.includes(tier.id)}
                                onCheckedChange={() => handleTierToggle(tier.id)}
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: tier.color }} />
                                <div className="flex-1">
                                    <div className="font-medium">{tier.name}</div>
                                    <div className="text-sm text-muted-foreground">${tier.price}</div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    ${tier.price}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    {selectedTiers.length} of {tiers.length} tiers selected
                </div>
            </CardContent>
        </Card>
    )
}

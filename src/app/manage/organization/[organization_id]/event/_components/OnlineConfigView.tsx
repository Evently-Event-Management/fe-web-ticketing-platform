// --- Online Configuration View ---
import {CreateEventFormData, Seat, SessionSeatingMapRequest} from "@/lib/validators/event";
import {useFormContext} from "react-hook-form";
import * as React from "react";
import {useState} from "react";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {SeatStatus} from "@/types/enums/SeatStatus";

export function OnlineConfigView({onSave}: {
    onSave: (layout: SessionSeatingMapRequest) => void;
}) {
    const {watch, getValues} = useFormContext<CreateEventFormData>();
    const tiers = watch('tiers');
    const [capacity, setCapacity] = useState(100);
    const [selectedTierId, setSelectedTierId] = useState<string | undefined>(tiers[0]?.id);

    const handleSave = () => {
        if (!selectedTierId) {
            toast.error("Please select a tier.");
            return;
        }

        // Generate the seats programmatically
        const seats: Seat[] = Array.from({length: capacity}, (_, i) => ({
            id: crypto.randomUUID(),
            label: `Slot ${i + 1}`,
            tierId: selectedTierId,
            status: SeatStatus.AVAILABLE,
        }));

        const layoutData: SessionSeatingMapRequest = {
            name: "Online Event Capacity",
            layout: {
                blocks: [{
                    id: crypto.randomUUID(),
                    name: "Online Attendees",
                    type: 'standing_capacity',
                    position: {x: 0, y: 0},
                    capacity: capacity,
                    seats: seats,
                }]
            }
        };
        onSave(layoutData);
    };

    return (
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input id="capacity" type="number" value={capacity}
                       onChange={e => setCapacity(parseInt(e.target.value) || 0)}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="tier">Ticket Tier</Label>
                <Select onValueChange={setSelectedTierId} defaultValue={selectedTierId}>
                    <SelectTrigger><SelectValue placeholder="Select a tier"/></SelectTrigger>
                    <SelectContent>
                        {tiers.map(tier => <SelectItem key={tier.id} value={tier.id}>{tier.name} -
                            ${tier.price}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleSave} type={'button'}  className="w-full">Set Capacity & Tier</Button>
        </div>
    );
}
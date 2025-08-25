'use client';

import {EventBasicInfoDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {Ticket} from "lucide-react";
import {toast} from "sonner";

// A single tier item, redesigned for a vertical list
const TierItem = ({tier}: { tier: EventBasicInfoDTO['tiers'][0]; }) => {
    return (
        <div
            className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: tier.color}}></div>
                <span className="font-semibold text-gray-800 dark:text-white">{tier.name}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">${tier.price.toFixed(2)}</span>
        </div>
    )
}

// The main section now organizes TierItems vertically and includes the CTA button
const TiersSection = ({tiers}: { tiers: EventBasicInfoDTO['tiers'] }) => {
    const handleBuyTickets = () => {
        // Show toast notification
        toast.info("Please select a session below to continue", {
            description: "Choose an available session for this event",
            duration: 3000,
        });

        // Scroll to sessions section
        const sessionsSection = document.getElementById('sessions-section');
        if (sessionsSection) {
            sessionsSection.scrollIntoView({behavior: 'smooth'});
        }
    };

    return (
        <div className="w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-6 h-6"/>
                Available Ticket Tiers
            </h2>
            <div className="flex flex-col gap-3">
                {tiers.map(tier => <TierItem key={tier.id} tier={tier}/>)}
            </div>
            <Button
                size="lg"
                className="w-full mt-4 font-bold"
                onClick={handleBuyTickets}
            >
                Buy Tickets
            </Button>
        </div>
    )
}

export default TiersSection;
import {EventBasicInfoDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {Ticket} from "lucide-react";


const TierPill = ({tier}: { tier: EventBasicInfoDTO['tiers'][0]; }) => {
    return (
        <div
            className="flex items-center gap-3 px-4 py-2 rounded-full shadow-sm cursor-pointer transform hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: tier.color }}
        >
            <span className="font-bold text-white text-sm">{tier.name}</span>
            <span className="text-xs font-semibold text-white/90 bg-black/20 px-2 py-0.5 rounded-full">${tier.price.toFixed(2)}</span>
        </div>
    )
}


const TiersSection = ({tiers}: { tiers: EventBasicInfoDTO['tiers'] }) => {
    return (
        <div className="max-w-7xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Tickets
            </h2>
            <div className="flex flex-wrap gap-3">
                {tiers.map(tier => <TierPill key={tier.id} tier={tier} />)}
            </div>
        </div>
    )
}

export default TiersSection;
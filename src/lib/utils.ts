import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {SessionFormData, Tier} from "@/lib/validators/event";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getTierColor = (tierId: string, session: SessionFormData, tiers: Tier[]): string => {
    if (tierId === 'unassigned') return '#d1d5db'; // gray-300

    // We need to check if tiers exist in the session
    const tier = tiers.find(t => t.id === tierId);
    return tier?.color || '#6b7280'; // gray-500 as fallback
};
// Helper to get tier name
export const getTierName = (tierId: string, session: SessionFormData, tiers: Tier[]): string => {
    if (tierId === 'unassigned') return 'Unassigned';

    const tier = tiers.find(t => t.id === tierId);
    return tier?.name || 'Unknown Tier';
};
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

/**
 * Formats a number into a currency string.
 * Uses the Intl.NumberFormat API for robust, localized currency formatting.
 *
 * @param {number} amount - The numerical value to format.
 * @param {string} [currency='USD'] - The ISO 4217 currency code (e.g., 'EUR', 'LKR'). Defaults to 'USD'.
 * @param {string} [locale='en-US'] - The locale string (e.g., 'de-DE', 'si-LK'). Defaults to 'en-US'.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        console.error("Failed to format currency:", error);
        // Fallback to a simple format if Intl fails for any reason
        return `${currency} ${amount.toFixed(2)}`;
    }
};

// You can also add other utility functions to this file, for example:
export const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch (error) {
        console.error("Failed to format date:", error);
        return "Invalid Date";
    }
};
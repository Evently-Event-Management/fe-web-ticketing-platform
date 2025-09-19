import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {SessionParsed, TierFormData} from "@/lib/validators/event";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getTierColor = (tierId: string, session: SessionParsed, tiers: TierFormData[]): string => {
    if (tierId === 'unassigned') return '#d1d5db'; // gray-300

    // We need to check if tiers exist in the session
    const tier = tiers.find(t => t.id === tierId);
    return tier?.color || '#6b7280'; // gray-500 as fallback
};
// Helper to get tier name
export const getTierName = (tierId: string, session: SessionParsed, tiers: TierFormData[]): string => {
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

export const formatDateTimeShort = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch (error) {
        console.error("Failed to format date:", error);
        return "Invalid Date";
    }
}

/**
 * Formats an ISO 8601 duration string into a human-readable format.
 * @param duration The ISO 8601 duration string (e.g., "P7D", "PT24H").
 * @returns A human-readable string (e.g., "7 days", "24 hours").
 */
export function formatISODuration(duration: string): string {
    if (!duration) return "N/A";

    const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?/);
    if (!match) return duration; // Return original if format is unexpected

    const days = match[1] ? parseInt(match[1]) : 0;
    const hours = match[2] ? parseInt(match[2]) : 0;

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return "Less than an hour";
}

export const formatToDateTimeLocalString = (dateInput: string | null | undefined): string => {
    if (!dateInput) return "";
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "";

        const pad = (num: number) => num.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Month is 0-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting date to datetime-local:", e);
        return "";
    }
};

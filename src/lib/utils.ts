import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {SessionDTO, TierFormData} from "@/lib/validators/event";
import {format, intervalToDuration, parseISO} from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getTierColor = (tierId: string, session: SessionDTO, tiers: TierFormData[]): string => {
    if (tierId === 'unassigned') return '#d1d5db'; // gray-300

    // We need to check if tiers exist in the session
    const tier = tiers.find(t => t.id === tierId);
    return tier?.color || '#6b7280'; // gray-500 as fallback
};
// Helper to get tier name
export const getTierName = (tierId: string, session: SessionDTO, tiers: TierFormData[]): string => {
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
    locale: string = 'en-US',
    toFixed: number = 2
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
        return `${currency} ${amount.toFixed(toFixed)}`; // Fallback formatting
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


// --- Helper: Display sales start time ---
export const getSalesStartTimeDisplay = (salesStartTime?: string): string => {
    if (!salesStartTime) return 'Sales start time not set';
    try {
        const salesStartDate = parseISO(salesStartTime);
        return `Sales start on ${format(salesStartDate, 'MMM d, yyyy h:mm a')}`;
    } catch (e) {
        console.error('Error parsing sales start time:', e);
        return 'Invalid sales start time';
    }
};


// --- Helper: Calculate sales window duration ---
export const getSalesWindowDuration = (
    salesStartTime?: string,
    sessionStartTime?: string
): string => {
    if (!salesStartTime || !sessionStartTime) return 'Sales window not available';
    try {
        const salesStart = parseISO(salesStartTime);
        const sessionStart = parseISO(sessionStartTime);

        if (salesStart > sessionStart) return 'Sales start after session begins';

        const duration = intervalToDuration({start: salesStart, end: sessionStart});
        const parts = [
            duration.days && `${duration.days}d`,
            duration.hours && `${duration.hours}h`,
            duration.minutes && `${duration.minutes}m`,
        ].filter(Boolean);

        if (parts.length === 0) return 'Sales open just before the session';
        return `Sales open for ${parts.join(', ')} before session`;
    } catch (e) {
        console.error('Error calculating sales window duration:', e);
        return 'Could not calculate duration';
    }
};
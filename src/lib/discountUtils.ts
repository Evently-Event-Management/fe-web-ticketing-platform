import {DiscountDTO, SelectedSeat} from "@/types/event";
import {DiscountType} from "@/types/enums/discountType";
import {DiscountParameters} from "@/lib/validators/event";
import {formatCurrency} from "@/lib/utils";

interface DiscountResult {
    finalPrice: number;
    discountAmount: number;
    description: string | null;
    error?: string;
}

/**
 * Calculates the final price after applying a discount based on a set of business rules.
 * @param subtotal The original total price of the cart.
 * @param discount The discount object to apply. Can be null.
 * @param selectedSeats The array of selected seats/tickets in the cart.
 * @returns An object containing the final price, discount amount, and a description.
 */
export const applyDiscount = (subtotal: number, discount: DiscountDTO | null, selectedSeats: SelectedSeat[]): DiscountResult => {
    if (!discount) {
        return { finalPrice: subtotal, discountAmount: 0, description: null };
    }

    // --- Universal Pre-Condition Checks ---

    // Check if at least one applicable tier is in the cart. This applies to all discount types.
    const applicableSeats = selectedSeats.filter(seat =>
        discount.applicableTiers?.some(tier => tier.id === seat.tier.id)
    );

    if ((discount.applicableTiers?.length ?? 0) > 0 && applicableSeats.length === 0) {
        const requiredTiers = discount.applicableTiers?.map(tier => tier.name).join(", ");
        return {
            finalPrice: subtotal,
            discountAmount: 0,
            description: null,
            error: `Discount not applicable to the items in your cart. At least one of the following tiers must be present: ${requiredTiers}.`
        };
    }


    // --- Type-Specific Logic & Pre-Condition Checks ---

    let discountAmount = 0;
    let description = "";
    let error: string | undefined;

    switch (discount.parameters.type) {
        case DiscountType.FLAT_OFF: {
            // Check for minSpend inside the case block where the type is known.
            if (discount.parameters.minSpend && subtotal < discount.parameters.minSpend) {
                return {
                    finalPrice: subtotal,
                    discountAmount: 0,
                    description: null,
                    error: `A minimum spend of ${formatCurrency(discount.parameters.minSpend, discount.parameters.currency || 'LKR')} is required.`
                };
            }

            discountAmount = discount.parameters.amount || 0;
            description = `${discount.parameters.currency} ${discountAmount} OFF`;
            break;
        }

        case DiscountType.PERCENTAGE: {
            // Check for minSpend inside the case block.
            if (discount.parameters.minSpend && subtotal < discount.parameters.minSpend) {
                return {
                    finalPrice: subtotal,
                    discountAmount: 0,
                    description: null,
                    error: `A minimum spend of ${formatCurrency(discount.parameters.minSpend, 'LKR')} is required.`
                };
            }

            let calculatedDiscount = subtotal * ((discount.parameters.percentage || 0) / 100);
            if (discount.parameters.maxDiscount) {
                calculatedDiscount = Math.min(calculatedDiscount, discount.parameters.maxDiscount);
            }
            discountAmount = calculatedDiscount;
            description = `${discount.parameters.percentage}% OFF`;
            break;
        }

        case DiscountType.BUY_N_GET_N_FREE: {
            const { buyQuantity, getQuantity } = discount.parameters;

            // Ensure we have sufficient applicable items
            if (applicableSeats.length < buyQuantity) {
                return {
                    finalPrice: subtotal,
                    discountAmount: 0,
                    description: null,
                    error: `You need at least ${buyQuantity} eligible items to use this discount.`
                };
            }

            const sortedApplicableSeats = [...applicableSeats].sort((a, b) => a.tier.price - b.tier.price);

            const numEligibleItems = sortedApplicableSeats.length;
            if (numEligibleItems >= buyQuantity) {
                const numFreeItems = Math.floor(numEligibleItems / buyQuantity) * getQuantity;
                discountAmount = sortedApplicableSeats
                    .slice(0, numFreeItems)
                    .reduce((total, seat) => total + seat.tier.price, 0);
            }
            description = `Buy ${buyQuantity}, Get ${getQuantity} Free`;
            break;
        }
    }

    // If there's an error, don't apply the discount
    if (error) {
        return { finalPrice: subtotal, discountAmount: 0, description: null, error };
    }

    const finalPrice = Math.max(0, subtotal - discountAmount);
    return { finalPrice, discountAmount, description };
};

export const getDiscountValue = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case DiscountType.PERCENTAGE: {
            const parts = [`${parameters.percentage}% OFF`];
            if (parameters.minSpend) {
                parts.push(`on orders over ${formatCurrency(parameters.minSpend, 'LKR')}`);
            }
            if (parameters.maxDiscount) {
                parts.push(`(up to ${formatCurrency(parameters.maxDiscount, 'LKR')})`);
            }
            return parts.join(' ');
        }
        case DiscountType.FLAT_OFF: {
            const parts = [`${formatCurrency(parameters.amount, parameters.currency)} OFF`];
            if (parameters.minSpend) {
                parts.push(`on orders over ${formatCurrency(parameters.minSpend, parameters.currency)}`);
            }
            return parts.join(' ');
        }
        case DiscountType.BUY_N_GET_N_FREE:
            return `Buy ${parameters.buyQuantity}, Get ${parameters.getQuantity} Free`;
    }
}
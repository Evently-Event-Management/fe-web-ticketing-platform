import { DiscountDTO, SelectedSeat } from "@/types/event";
import { DiscountType } from "@/types/enums/discountType";

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
        discount.applicableTierIds?.includes(seat.tier.id)
    );
    if (discount.applicableTierIds?.length > 0 && applicableSeats.length === 0) {
        return { finalPrice: subtotal, discountAmount: 0, description: null, error: "Discount not applicable to the items in your cart." };
    }

    // --- Type-Specific Logic & Pre-Condition Checks ---

    let discountAmount = 0;
    let description = "";

    switch (discount.parameters.type) {
        case DiscountType.FLAT_OFF: {
            // ✅ FIX: Check for minSpend inside the case block where the type is known.
            if (discount.parameters.minSpend && subtotal < discount.parameters.minSpend) {
                return { finalPrice: subtotal, discountAmount: 0, description: null, error: `A minimum spend of ${discount.parameters.minSpend} is required.` };
            }

            discountAmount = discount.parameters.amount || 0;
            description = `${discount.parameters.currency} ${discountAmount} OFF`;
            break;
        }

        case DiscountType.PERCENTAGE: {
            // ✅ FIX: Check for minSpend inside the case block.
            if (discount.parameters.minSpend && subtotal < discount.parameters.minSpend) {
                return { finalPrice: subtotal, discountAmount: 0, description: null, error: `A minimum spend of ${discount.parameters.minSpend} is required.` };
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
            // This type doesn't have minSpend, so we don't check for it.
            const { buyQuantity, getQuantity } = discount.parameters;

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

    const finalPrice = Math.max(0, subtotal - discountAmount);
    return { finalPrice, discountAmount, description };
};
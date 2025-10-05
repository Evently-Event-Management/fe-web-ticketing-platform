import { apiFetch } from '@/lib/api';
import {DiscountRequest} from "@/lib/validators/event";

const API_BASE_PATH = '/event-seating/v1/events';

export type DiscountResponse = DiscountRequest & {}

/**
 * Creates a new discount for an event.
 * 
 * @param eventId ID of the event to create the discount for
 * @param discountData The discount data to create
 * @returns The created discount details
 */
export const createDiscount = (eventId: string, discountData: DiscountRequest): Promise<DiscountResponse> => {
  return apiFetch<DiscountResponse>(`${API_BASE_PATH}/${eventId}/discounts`, {
    method: 'POST',
    body: JSON.stringify(discountData),
  });
};

/**
 * Fetches a list of discounts for an event.
 * 
 * @param eventId ID of the event
 * @param includePrivate Whether to include private discounts (default: false)
 * @returns Paginated list of discounts
 */
export const getDiscounts = (
  eventId: string,
  includePrivate: boolean = false,
): Promise<DiscountResponse[]> => {
  const params = new URLSearchParams({
    includePrivate: includePrivate.toString(),
  });

  return apiFetch<DiscountResponse[]>(
    `${API_BASE_PATH}/${eventId}/discounts?${params.toString()}`
  );
};

/**
 * Fetches a specific discount for an event.
 * 
 * @param eventId ID of the event
 * @param discountId ID of the discount to fetch
 * @returns The discount details
 */
export const getDiscount = (eventId: string, discountId: string): Promise<DiscountResponse> => {
  return apiFetch<DiscountResponse>(`${API_BASE_PATH}/${eventId}/discounts/${discountId}`);
};

/**
 * Updates an existing discount for an event.
 * 
 * @param eventId ID of the event
 * @param discountId ID of the discount to update
 * @param discountData The updated discount data
 * @returns The updated discount details
 */
export const updateDiscount = (
  eventId: string,
  discountId: string,
  discountData: DiscountRequest
): Promise<DiscountResponse> => {
  return apiFetch<DiscountResponse>(`${API_BASE_PATH}/${eventId}/discounts/${discountId}`, {
    method: 'PUT',
    body: JSON.stringify(discountData),
  });
};

/**
 * Deletes a discount for an event.
 * 
 * @param eventId ID of the event
 * @param discountId ID of the discount to delete
 * @returns void as the endpoint returns no content
 */
export const deleteDiscount = (eventId: string, discountId: string): Promise<void> => {
  return apiFetch<void>(`${API_BASE_PATH}/${eventId}/discounts/${discountId}`, {
    method: 'DELETE',
  });
};

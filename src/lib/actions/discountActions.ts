import { apiFetch } from '@/lib/api';
import { PaginatedResponse } from "@/types/paginatedResponse";
import {DiscountRequest} from "@/lib/validators/event";
import {DiscountDTO} from "@/types/event";

const API_BASE_PATH = '/event-seating/v1/events';

/**
 * Creates a new discount for an event.
 * 
 * @param eventId ID of the event to create the discount for
 * @param discountData The discount data to create
 * @returns The created discount details
 */
export const createDiscount = (eventId: string, discountData: DiscountRequest): Promise<DiscountDTO> => {
  return apiFetch<DiscountDTO>(`${API_BASE_PATH}/${eventId}/discounts`, {
    method: 'POST',
    body: JSON.stringify(discountData),
  });
};

/**
 * Fetches a list of discounts for an event.
 * 
 * @param eventId ID of the event
 * @param includePrivate Whether to include private discounts (default: false)
 * @param page Page number (default: 0)
 * @param size Page size (default: 10)
 * @returns Paginated list of discounts
 */
export const getDiscounts = (
  eventId: string,
  includePrivate: boolean = false,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<DiscountDTO>> => {
  const params = new URLSearchParams({
    includePrivate: includePrivate.toString(),
    page: page.toString(),
    size: size.toString(),
  });

  return apiFetch<PaginatedResponse<DiscountDTO>>(
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
export const getDiscount = (eventId: string, discountId: string): Promise<DiscountDTO> => {
  return apiFetch<DiscountDTO>(`${API_BASE_PATH}/${eventId}/discounts/${discountId}`);
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
): Promise<DiscountDTO> => {
  return apiFetch<DiscountDTO>(`${API_BASE_PATH}/${eventId}/discounts/${discountId}`, {
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

import { apiFetch } from '@/lib/api';

const API_BASE_PATH = '/event-seating/v1/events';

/**
 * Interface for event response from the API
 */
export interface EventResponseDTO {
  id: string;
  title: string;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request data for updating basic event details
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  overview?: string;
  categoryId?: string;
}

/**
 * Updates basic event details (title, description, overview)
 * 
 * @param eventId ID of the event to update
 * @param updateData The event data to update
 * @returns The updated event details
 */
export const updateEventDetails = (
  eventId: string, 
  updateData: UpdateEventRequest
): Promise<EventResponseDTO> => {
  return apiFetch<EventResponseDTO>(`${API_BASE_PATH}/${eventId}/update`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

/**
 * Adds a cover photo to an event
 * 
 * @param eventId ID of the event
 * @param file The image file to upload
 * @returns The updated event details including the new cover photo
 */
export const addCoverPhoto = (
  eventId: string, 
  file: File
): Promise<EventResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<EventResponseDTO>(`${API_BASE_PATH}/${eventId}/update/cover-photos`, {
    method: 'POST',
    body: formData,
    // FormData will be automatically detected by apiFetch and Content-Type header will be omitted
  });
};

/**
 * Removes a cover photo from an event
 * 
 * @param eventId ID of the event
 * @param photoId ID of the photo to remove
 * @returns The updated event details
 */
export const removeCoverPhoto = (
  eventId: string, 
  photoId: string
): Promise<EventResponseDTO> => {
  return apiFetch<EventResponseDTO>(`${API_BASE_PATH}/${eventId}/update/cover-photos/${photoId}`, {
    method: 'DELETE',
  });
};

/**
 * Helper function to handle file upload for cover photos with error handling
 * 
 * @param eventId ID of the event
 * @param file The image file to upload
 * @returns Promise with the updated event or error
 */
export const uploadEventCoverPhoto = async (
  eventId: string, 
  file: File
): Promise<{ success: boolean; data?: EventResponseDTO; error?: string }> => {
  try {
    // Validate file size (e.g., limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: `File size exceeds the maximum allowed size (5MB). Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Only JPEG, PNG, and WebP images are allowed.' 
      };
    }

    const result = await addCoverPhoto(eventId, file);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred while uploading the cover photo' 
    };
  }
};
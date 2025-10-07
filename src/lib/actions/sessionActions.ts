import { apiFetch } from '@/lib/api';
import { 
  SessionDTO,
  SessionDetailDTO, 
  VenueDetails, 
  SessionSeatingMapRequest,
} from "@/lib/validators/event";
import { SessionStatus } from '@/types/enums/sessionStatus';

const API_BASE_PATH = '/event-seating/v1';

/**
 * Response type for batch session creation
 */
export interface SessionBatchResponse {
  eventId: string;
  totalCreated: number;
  sessions: SessionDetailDTO[];
}

/**
 * Request type for creating multiple sessions
 */
export interface CreateSessionsRequest {
  eventId: string;
  sessions: SessionDTO[];
}

/**
 * Request type for updating session time
 */
export interface SessionTimeUpdateRequest {
  startTime: string;
  endTime: string;
  salesStartTime: string;
}

/**
 * Request type for updating session status
 */
export interface SessionStatusUpdateRequest {
  status: SessionStatus;
}

/**
 * Request type for updating session venue and seating
 */
export interface SessionVenueUpdateRequest {
  venueDetails: VenueDetails;
  layoutData: SessionSeatingMapRequest;
}

/**
 * Creates multiple sessions for an event.
 * 
 * @param createData Request containing event ID and session details
 * @returns Response with created sessions information
 */
export const createSessions = (createData: CreateSessionsRequest): Promise<SessionBatchResponse> => {
  return apiFetch<SessionBatchResponse>(`${API_BASE_PATH}/sessions`, {
    method: 'POST',
    body: JSON.stringify(createData),
  });
};

/**
 * Fetches a specific session by ID.
 * 
 * @param sessionId ID of the session to fetch
 * @returns The session details
 */
export const getSession = (sessionId: string): Promise<SessionDetailDTO> => {
  return apiFetch<SessionDetailDTO>(`${API_BASE_PATH}/sessions/${sessionId}`);
};

/**
 * Fetches all sessions for a specific event.
 * 
 * @param eventId ID of the event to fetch sessions for
 * @returns List of session details
 */
export const getSessionsByEventId = (eventId: string): Promise<SessionDetailDTO[]> => {
  return apiFetch<SessionDetailDTO[]>(`${API_BASE_PATH}/sessions?eventId=${eventId}`);
};

/**
 * Updates a session's time details (start time, end time, sales start time).
 * Only allowed for SCHEDULED and ON_SALE sessions.
 * 
 * @param sessionId ID of the session to update
 * @param timeData New time details
 * @returns The updated session details
 */
export const updateSessionTime = (
  sessionId: string,
  timeData: SessionTimeUpdateRequest
): Promise<SessionDetailDTO> => {
  return apiFetch<SessionDetailDTO>(`${API_BASE_PATH}/sessions/${sessionId}/time`, {
    method: 'PUT',
    body: JSON.stringify(timeData),
  });
};

/**
 * Updates a session's status.
 * Valid transitions: SCHEDULED -> ON_SALE -> CLOSED
 * 
 * @param sessionId ID of the session to update
 * @param statusData New status data
 * @returns The updated session details
 */
export const updateSessionStatus = (
  sessionId: string,
  statusData: SessionStatusUpdateRequest
): Promise<SessionDetailDTO> => {
  return apiFetch<SessionDetailDTO>(`${API_BASE_PATH}/sessions/${sessionId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

/**
 * Updates a session's venue details and seating layout.
 * Only allowed for SCHEDULED sessions.
 * 
 * @param sessionId ID of the session to update
 * @param venueData New venue details and seating layout
 * @returns The updated session details
 */
export const updateSessionVenue = (
  sessionId: string,
  venueData: SessionVenueUpdateRequest
): Promise<SessionDetailDTO> => {
  return apiFetch<SessionDetailDTO>(`${API_BASE_PATH}/sessions/${sessionId}/venue`, {
    method: 'PUT',
    body: JSON.stringify(venueData),
  });
};

/**
 * Deletes a session.
 * Only allowed before sales start.
 * 
 * @param sessionId ID of the session to delete
 * @returns void as the endpoint returns no content
 */
export const deleteSession = (sessionId: string): Promise<void> => {
  return apiFetch<void>(`${API_BASE_PATH}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
};
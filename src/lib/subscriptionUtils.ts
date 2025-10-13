import { toast } from "sonner";
import { 
  subscribeToEvent, 
  unsubscribeFromEvent, 
  checkEventSubscriptionStatus,
  subscribeToSession,
  unsubscribeFromSession,
  checkSessionSubscriptionStatus,
  subscribeToOrganization,
  unsubscribeFromOrganization,
  checkOrganizationSubscriptionStatus,
  SubscriptionResponse
} from '@/lib/actions/eventActions';

export interface SubscriptionRequest {
  id: string;      // ID of the entity to subscribe to (event, session, organization)
  type: 'event' | 'session' | 'organization';  // Type of subscription
  name?: string;   // Optional name for better error messages
}

/**
 * Subscribe to an entity (event, session, or organization)
 * @param request The subscription request
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function subscribeToEntity(request: SubscriptionRequest): Promise<boolean> {
  try {
    let response: SubscriptionResponse;
    
    // Use entity-specific subscription functions based on type
    switch (request.type) {
      case 'event':
        response = await subscribeToEvent(request.id);
        break;
      case 'session':
        response = await subscribeToSession(request.id);
        break;
      case 'organization':
        response = await subscribeToOrganization(request.id);
        break;
      default:
        throw new Error(`Unsupported entity type: ${request.type}`);
    }
    
    if (response.message && response.message.includes("success")) {
      return true;
    } else if (response.error) {
      throw new Error(response.error);
    } else {
      return true; // If there's no error, consider it successful
    }
  } catch (error) {
    console.error(`Failed to subscribe to ${request.type} ${request.name || request.id}:`, error);
    toast.error(`Failed to subscribe to ${request.name || request.id}`);
    return false;
  }
}

/**
 * Unsubscribe from an entity (event, session, or organization)
 * @param request The subscription request
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function unsubscribeFromEntity(request: SubscriptionRequest): Promise<boolean> {
  try {
    let response: SubscriptionResponse;
    
    // Use entity-specific unsubscription functions based on type
    switch (request.type) {
      case 'event':
        response = await unsubscribeFromEvent(request.id);
        break;
      case 'session':
        response = await unsubscribeFromSession(request.id);
        break;
      case 'organization':
        response = await unsubscribeFromOrganization(request.id);
        break;
      default:
        throw new Error(`Unsupported entity type: ${request.type}`);
    }
    
    if (response.message && response.message.includes("success")) {
      return true;
    } else if (response.error) {
      throw new Error(response.error);
    } else {
      return true; // If there's no error, consider it successful
    }
  } catch (error) {
    console.error(`Failed to unsubscribe from ${request.type} ${request.name || request.id}:`, error);
    toast.error(`Failed to unsubscribe from ${request.name || request.id}`);
    return false;
  }
}

/**
 * Check if the user is subscribed to an entity
 * @param entityId The ID of the entity to check
 * @param type The type of entity (event, session, organization)
 * @returns Promise that resolves to true if subscribed, false otherwise
 */
export async function checkSubscriptionStatus(
  entityId: string,
  type: 'event' | 'session' | 'organization'
): Promise<boolean> {
  try {
    // Use entity-specific status check functions based on type
    switch (type) {
      case 'event':
        return await checkEventSubscriptionStatus(entityId);
      case 'session':
        return await checkSessionSubscriptionStatus(entityId);
      case 'organization':
        return await checkOrganizationSubscriptionStatus(entityId);
      default:
        throw new Error(`Unsupported entity type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to check subscription status for ${type} ${entityId}:`, error);
    return false;
  }
}

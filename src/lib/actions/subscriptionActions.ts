'use server'

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088/api';

// Event subscription payload
export interface EventSubscriptionPayload {
  eventId: string;
  userId: string;
  notificationType?: 'email' | 'push' | 'both';
}

// Session subscription payload
export interface SessionSubscriptionPayload {
  sessionId: string;
  userId: string;
  notificationType?: 'email' | 'push' | 'both';
}

// Organization subscription payload
export interface OrganizationSubscriptionPayload {
  organizationId: string;
  userId: string;
  notificationType?: 'email' | 'push' | 'both';
}

export async function subscribeToEventServerAction(payload: EventSubscriptionPayload, authToken: string) {
  try {
    const response = await fetch(`${API_URL}/scheduler/subscription/v1/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Event subscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side event subscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function unsubscribeFromEventServerAction(eventId: string, authToken: string) {
  try {
    const response = await fetch(`${API_URL}/scheduler/subscription/v1/unsubscribe/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      return { success: false, error: `Event unsubscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side event unsubscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function checkEventSubscriptionStatusServerAction(
  eventId: string,
  authToken: string
) {
  try {
    const response = await fetch(
      `${API_URL}/scheduler/subscription/v1/is-subscribed/${eventId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to check event subscription status: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, isSubscribed: data.isSubscribed };
  } catch (error) {
    console.error('Server-side event subscription status check error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function subscribeToSessionServerAction(payload: SessionSubscriptionPayload, authToken: string) {
  try {
    const response = await fetch(`${API_URL}/scheduler/session-subscription/v1/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Session subscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side session subscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function unsubscribeFromSessionServerAction(sessionId: string, authToken: string) {
  try {
    const response = await fetch(`${API_URL}/scheduler/session-subscription/v1/unsubscribe/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      return { success: false, error: `Session unsubscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side session unsubscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function checkSessionSubscriptionStatusServerAction(
  sessionId: string,
  authToken: string
) {
  try {
    const response = await fetch(
      `${API_URL}/session-subscription/v1/is-subscribed/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to check session subscription status: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, isSubscribed: data.isSubscribed };
  } catch (error) {
    console.error('Server-side session subscription status check error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getUserEventSubscriptionsServerAction(authToken: string) {
  try {
    const response = await fetch(
      `${API_URL}/subscription/v1/user-subscriptions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to get user event subscriptions: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, subscriptions: data };
  } catch (error) {
    console.error('Server-side get user event subscriptions error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getUserSessionSubscriptionsServerAction(authToken: string) {
  try {
    const response = await fetch(
      `${API_URL}/session-subscription/v1/user-subscriptions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to get user session subscriptions: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, subscriptions: data };
  } catch (error) {
    console.error('Server-side get user session subscriptions error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Organization subscription endpoints
export async function subscribeToOrganizationServerAction(payload: OrganizationSubscriptionPayload, authToken: string) {
  try {
    // Using event subscription API for organization for now, as there's no dedicated organization subscription endpoint
    const response = await fetch(`${API_URL}/subscription/v1/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        ...payload,
        entityId: payload.organizationId,
        entityType: 'organization'
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Organization subscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side organization subscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function unsubscribeFromOrganizationServerAction(organizationId: string, authToken: string) {
  try {
    // Using event subscription API for organization for now, as there's no dedicated organization subscription endpoint
    const response = await fetch(`${API_URL}/subscription/v1/unsubscribe/${organizationId}?entityType=organization`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      return { success: false, error: `Organization unsubscription failed with status: ${response.status}` };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Server-side organization unsubscription error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function checkOrganizationSubscriptionStatusServerAction(
  organizationId: string,
  authToken: string
) {
  try {
    // Using event subscription API for organization for now, as there's no dedicated organization subscription endpoint
    const response = await fetch(
      `${API_URL}/subscription/v1/is-subscribed/${organizationId}?entityType=organization`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to check organization subscription status: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, isSubscribed: data.isSubscribed };
  } catch (error) {
    console.error('Server-side organization subscription status check error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
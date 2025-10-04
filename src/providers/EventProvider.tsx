"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getMyEventById } from "@/lib/actions/eventActions";
import { EventDetailDTO } from "@/lib/validators/event";
import { OrganizationResponse } from "@/types/oraganizations";
import { toast } from "sonner";
import { useOrganization } from "@/providers/OrganizationProvider";

interface EventContextProps {
  event: EventDetailDTO | null;
  organization: OrganizationResponse | null;
  isLoading: boolean;
  error: string | null;
  refetchEventData: () => Promise<void>;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  
  return context;
};

interface EventProviderProps {
  children: ReactNode;
  eventId: string;
}

export const EventProvider = ({ children, eventId }: EventProviderProps) => {
  const [event, setEvent] = useState<EventDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organizations, organization: currentOrganization, switchOrganization } = useOrganization();

  const fetchEventData = useCallback(async () => {
    if (!eventId) {
      setError("No event ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const eventData = await getMyEventById(eventId);
      setEvent(eventData);

      // If the event belongs to a different organization than the current one,
      // switch to the event's organization
      if (eventData && eventData.organizationId &&
          currentOrganization && eventData.organizationId !== currentOrganization.id) {
        await switchOrganization(eventData.organizationId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load event details";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching event data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, currentOrganization, switchOrganization]);

  // Initial fetch
  React.useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Find the correct organization for this event
  const eventOrganization = React.useMemo(() => {
    if (!event || !event.organizationId || !organizations) return null;
    return organizations.find(org => org.id === event.organizationId) || null;
  }, [event, organizations]);

  const value = {
    event,
    organization: eventOrganization,
    isLoading,
    error,
    refetchEventData: fetchEventData
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

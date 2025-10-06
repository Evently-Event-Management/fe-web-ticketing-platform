"use client";

import React, {createContext, useContext, useState, useCallback, ReactNode, useEffect} from "react";
import {getMyEventById} from "@/lib/actions/eventActions";
import {EventDetailDTO, SessionDetailDTO} from "@/lib/validators/event";
import {OrganizationResponse} from "@/types/oraganizations";
import {toast} from "sonner";
import {useOrganization} from "@/providers/OrganizationProvider";
import {DiscountResponse, getDiscounts} from "@/lib/actions/discountActions";
import {getSession, getSessionsByEventId} from "@/lib/actions/sessionActions";

interface EventContextProps {
    event: EventDetailDTO | null;
    organization: OrganizationResponse | null;
    isLoading: boolean;
    error: string | null;
    loadingSessionId: string | null; // Track which session is currently loading
    refetchEventData: () => Promise<void>;
    refetchDiscounts: () => Promise<void>;
    setDiscounts: (discounts: DiscountResponse[]) => void;
    refetchSessions: () => Promise<void>;
    refetchSession: (sessionId: string) => Promise<void>;
    setSessions: (sessions: SessionDetailDTO[]) => void;
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

export const EventProvider = ({children, eventId}: EventProviderProps) => {
    const [event, setEvent] = useState<EventDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
    const {organizations, organization: currentOrganization, switchOrganization} = useOrganization();

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
    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);


    const fetchDiscounts = useCallback(async () => {
        if (!event?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await getDiscounts(event.id, true);
            setEvent(prev => prev ? {...prev, discounts: response || []} : prev);
        } catch (err) {
            const message = "Failed to load discounts. Please try again.";
            setError(message);
            console.error(err);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [event?.id]);


    const setDiscounts = (discounts: DiscountResponse[]) => {
        setEvent(prev => prev ? {...prev, discounts} : prev);
    }

    // Set sessions directly - useful for optimistic UI updates
    const setSessions = (sessions: SessionDetailDTO[]) => {
        setEvent(prev => prev ? {...prev, sessions} : prev);
    }

    // Fetch all sessions for the current event
    const fetchSessions = useCallback(async () => {
        if (!event?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const sessions = await getSessionsByEventId(event.id);
            setEvent(prev => prev ? {...prev, sessions} : prev);
        } catch (err) {
            const message = "Failed to load sessions. Please try again.";
            setError(message);
            console.error(err);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [event?.id]);

    // Fetch a specific session and update it in the array
    const fetchSession = useCallback(async (sessionId: string) => {
        if (!event?.id || !sessionId) return;
        
        setLoadingSessionId(sessionId); // Track which session is loading
        
        try {
            const updatedSession = await getSession(sessionId);
            
            // Update the specific session in the array
            setEvent(prev => {
                if (!prev || !prev.sessions) return prev;
                
                const updatedSessions = prev.sessions.map(session => 
                    session.id === sessionId ? updatedSession : session
                );
                
                return {...prev, sessions: updatedSessions};
            });
        } catch (err) {
            const message = `Failed to update session. Please try again.`;
            console.error(err);
            toast.error(message);
        } finally {
            setLoadingSessionId(null);
        }
    }, [event?.id]);

    useEffect(() => {
        if (event?.id) {
            fetchDiscounts();
        }
    }, [event?.id, fetchDiscounts]);

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
        loadingSessionId,
        refetchEventData: fetchEventData,
        refetchDiscounts: fetchDiscounts,
        setDiscounts,
        refetchSessions: fetchSessions,
        refetchSession: fetchSession,
        setSessions
    };

    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

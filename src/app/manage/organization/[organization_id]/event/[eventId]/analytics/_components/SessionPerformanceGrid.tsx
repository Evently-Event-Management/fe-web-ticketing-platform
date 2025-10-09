"use client"

import React, { useEffect, useState } from 'react';
import { SessionSummary } from "@/types/eventAnalytics";
import { SessionPerformanceCard } from "./SessionPerformanceCard";
import { SessionSummary as OrderSessionSummary, getSessionsRevenueAnalytics } from "@/lib/actions/analyticsActions";
import { useParams } from "next/navigation";
import { useEventContext } from "@/providers/EventProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionPerformanceGridProps {
  sessions: SessionSummary[];
  isLoading: boolean;
}

export const SessionPerformanceGrid = ({ 
  sessions, 
  isLoading 
}: SessionPerformanceGridProps) => {
  const [sessionRevenueData, setSessionRevenueData] = useState<OrderSessionSummary[]>([]);
  const [isRevenueLoading, setIsRevenueLoading] = useState(true);
  const params = useParams();
  const { event } = useEventContext();
  
  const organizationId = params.organization_id as string;
  const eventId = params.eventId as string;
  
  // Fetch revenue data for sessions
  useEffect(() => {
    const fetchRevenueData = async () => {
      if (eventId) {
        try {
          setIsRevenueLoading(true);
          const data = await getSessionsRevenueAnalytics(eventId);
          setSessionRevenueData(data.sessions);
        } catch (error) {
          console.error("Error fetching session revenue data:", error);
        } finally {
          setIsRevenueLoading(false);
        }
      }
    };
    
    fetchRevenueData();
  }, [eventId]);
  
  // Match session revenue data with session metadata from event context
  const getSessionRevenue = (sessionId: string) => {
    return sessionRevenueData.find(s => s.session_id === sessionId);
  };
  
  const getSessionMetadata = (sessionId: string) => {
    return event?.sessions?.find(s => s.id === sessionId);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <Skeleton key={index} className="h-[280px] w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Session Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => (
          <SessionPerformanceCard 
            key={session.sessionId}
            session={session}
            sessionRevenue={getSessionRevenue(session.sessionId)}
            sessionMetadata={getSessionMetadata(session.sessionId)}
            organizationId={organizationId}
            eventId={eventId}
          />
        ))}
      </div>
    </div>
  );
};
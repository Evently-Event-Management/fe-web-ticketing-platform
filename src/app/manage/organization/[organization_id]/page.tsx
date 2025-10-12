'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useOrganization } from '@/providers/OrganizationProvider';
import { WelcomeBar } from './_components/WelcomeBar';
import { StatsCard } from './_components/StatsCard';
import { SessionStatusChart } from './_components/SessionStatusChart';
import { RevenueChart } from './_components/RevenueChart';
import { EventsTable } from './_components/EventsTable';
import { SessionsTable } from './_components/SessionsTable';
import { DiscountUsageChart } from './_components/DiscountUsageChart';
import { EventSummaryDTO } from '@/lib/validators/event';
import { OrganizationSessionDTO, SessionStatusCountDTO, getOrganizationSessionAnalytics, getOrganizationSessions } from '@/lib/actions/statsActions';
import { getEventOrderAnalyticsBatch, DailySalesMetrics, DiscountUsage, getEventDiscountAnalytics } from '@/lib/actions/analyticsActions';
import { getMyOrganizationEvents } from '@/lib/actions/eventActions';
import { Loader } from '@/components/Loader';
import { DollarSign, Tag, Calendar, Ticket } from 'lucide-react';

export default function OrganizationDashboard() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const params = useParams<{ organization_id: string }>();
  const organizationId = params.organization_id as string;
  
  // State for various data types
  const [events, setEvents] = useState<EventSummaryDTO[]>([]);
  const [sessions, setSessions] = useState<OrganizationSessionDTO[]>([]);
  const [sessionsByStatus, setSessionsByStatus] = useState<SessionStatusCountDTO[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailySalesMetrics[]>([]);
  const [discounts, setDiscounts] = useState<DiscountUsage[]>([]);
  
  // Loading states
  const [eventsLoading, setEventsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [discountsLoading, setDiscountsLoading] = useState(true);

  // Summary statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  
  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setEventsLoading(true);
      const response = await getMyOrganizationEvents(organizationId, undefined, undefined, 0, 5);
      setEvents(response.content || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setEventsLoading(false);
    }
  }, [organizationId]);
  
  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setSessionsLoading(true);
      const response = await getOrganizationSessions(organizationId, undefined, 0, 5);
      setSessions(response.content || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  }, [organizationId]);
  
  // Fetch session analytics
  const fetchSessionAnalytics = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setStatsLoading(true);
      const response = await getOrganizationSessionAnalytics(organizationId);
      setSessionsByStatus(response.sessionsByStatus || []);
      setTotalSessions(response.totalSessions || 0);
    } catch (error) {
      console.error("Failed to fetch session analytics:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [organizationId]);
  
  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!organizationId || !events.length) return;
    
    try {
      setRevenueLoading(true);
      const eventIds = events.map(event => event.id);
      const response = await getEventOrderAnalyticsBatch(eventIds);
      
      setTotalRevenue(response.total_revenue || 0);
      setTotalTicketsSold(response.total_tickets_sold || 0);
      setDailyRevenue(response.daily_sales || []);
      
      // Fetch discount data for all events
      const discountPromises = eventIds.map(eventId => getEventDiscountAnalytics(eventId));
      const discountResponses = await Promise.all(discountPromises);
      
      // Combine discount data from all events
      const allDiscounts: DiscountUsage[] = [];
      let totalDiscount = 0;
      
      discountResponses.forEach(response => {
        if (response.discount_usage) {
          response.discount_usage.forEach(discount => {
            allDiscounts.push(discount);
            totalDiscount += discount.total_discount_amount;
          });
        }
      });
      
      setDiscounts(allDiscounts);
      setTotalDiscountAmount(totalDiscount);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setRevenueLoading(false);
      setDiscountsLoading(false);
    }
  }, [organizationId, events]);
  
  // Load data when organization ID or events change
  useEffect(() => {
    if (organizationId) {
      fetchEvents();
      fetchSessions();
      fetchSessionAnalytics();
    }
  }, [organizationId, fetchEvents, fetchSessions, fetchSessionAnalytics]);
  
  // Load revenue data after events are loaded
  useEffect(() => {
    if (events.length > 0) {
      fetchRevenueData();
    }
  }, [events, fetchRevenueData]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  if (orgLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <WelcomeBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={revenueLoading}
          variant="revenue"
          description="Overall revenue across all events"
        />
        
        <StatsCard
          title="Total Discounts"
          value={formatCurrency(totalDiscountAmount)}
          icon={<Tag className="h-4 w-4" />}
          isLoading={discountsLoading}
          variant="discount"
          description="Total discount amount given"
        />
        
        <StatsCard
          title="Total Sessions"
          value={totalSessions}
          icon={<Calendar className="h-4 w-4" />}
          isLoading={statsLoading}
          variant="sessions"
          description="Sessions across all events"
        />
        
        <StatsCard
          title="Tickets Sold"
          value={totalTicketsSold}
          icon={<Ticket className="h-4 w-4" />}
          isLoading={revenueLoading}
          variant="tickets"
          description="Total ticket sales"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <RevenueChart
          data={dailyRevenue}
          isLoading={revenueLoading}
        />
        
        <SessionStatusChart
          data={sessionsByStatus}
          isLoading={statsLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <DiscountUsageChart
          data={discounts}
          isLoading={discountsLoading}
        />
        
        <div className="col-span-3">
          <EventsTable
            events={events}
            isLoading={eventsLoading}
          />
        </div>
      </div>
      
      <SessionsTable
        sessions={sessions}
        isLoading={sessionsLoading}
      />
    </div>
  );
}
"use client"

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRightIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { SessionSummary } from "@/types/eventAnalytics";
import { SessionSummary as OrderSessionSummary } from "@/lib/actions/analyticsActions";
import { useRouter } from "next/navigation";
import { SessionDetailDTO } from "@/lib/validators/event";
import { SessionStatusBadge } from "@/components/SessionStatusBadge";
import Link from "next/link";

interface SessionPerformanceCardProps {
  session: SessionSummary;
  sessionRevenue?: OrderSessionSummary;
  sessionMetadata?: SessionDetailDTO;
  organizationId: string;
  eventId: string;
}

export const SessionPerformanceCard = ({
  session,
  sessionRevenue,
  sessionMetadata,
  organizationId,
  eventId
}: SessionPerformanceCardProps) => {
  const router = useRouter();
  
  // Basic session info
  const sessionId = session.sessionId;
  const startTime = parseISO(session.startTime);
  const endTime = parseISO(session.endTime);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Duration in minutes
  
  // Revenue info
  const revenue = session.sessionRevenue;
  const totalRevenue = sessionRevenue?.total_revenue || revenue;
  const beforeDiscounts = sessionRevenue?.total_before_discounts;
  const discountAmount = beforeDiscounts ? beforeDiscounts - totalRevenue : 0;
  
  // Capacity info
  const capacity = session.sessionCapacity;
  const ticketsSold = session.ticketsSold;
  const sellOutPercentage = session.sellOutPercentage;
  
  // Session metadata (from event context)
  const isOnline = sessionMetadata?.sessionType === "ONLINE";
  const location = isOnline 
    ? "Online Event" 
    : sessionMetadata?.venueDetails?.name || "Venue not specified";
  
  const handleViewDetails = () => {
    router.push(`/manage/organization/${organizationId}/event/${eventId}/sessions/${sessionId}/analytics`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SessionStatusBadge status={session.sessionStatus} />
            <div className="flex items-center">
              <span className="font-medium">{format(startTime, "EEE, MMM d")}</span>
              <span className="mx-1.5 text-muted-foreground">•</span>
              <span>{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}</span>
            </div>
          </div>
          <Link 
            href={`/manage/organization/${organizationId}/event/${eventId}/sessions/${sessionId}/analytics`}
            className="no-underline"
          >
            <Button variant="secondary" size="sm" className="gap-1">
              <span>Details</span>
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Session Info</h4>
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{Math.floor(duration / 60)}h {duration % 60}m</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{capacity} capacity</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Sales Performance</h4>
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-medium">{formatCurrency(totalRevenue, 'LKR', 'en-LK')}</span>
              </div>
              
              {beforeDiscounts && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Discounts</span>
                  <span className="font-medium text-destructive">-{formatCurrency(discountAmount, 'LKR', 'en-LK')}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tickets sold</span>
                <span className="font-medium">{ticketsSold} / {capacity}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sell-out progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium">Sell-out Progress</span>
            <span className="text-sm text-muted-foreground">{sellOutPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{width: `${sellOutPercentage}%`}}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
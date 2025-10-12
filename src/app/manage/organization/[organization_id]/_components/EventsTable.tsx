'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventSummaryDTO } from "@/lib/validators/event";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Ticket } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface EventsTableProps {
  events: EventSummaryDTO[];
  isLoading: boolean;
}

export const EventsTable = ({
  events,
  isLoading
}: EventsTableProps) => {
  const params = useParams<{ organization_id: string }>();
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get badge color based on event status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PUBLISHED':
        return 'bg-success text-success-foreground';
      case 'DRAFT':
        return 'bg-muted text-muted-foreground';
      case 'PENDING':
        return 'bg-warning text-warning-foreground';
      case 'REJECTED':
        return 'bg-destructive text-destructive-foreground';
      case 'CANCELLED':
        return 'bg-destructive/80 text-destructive-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Your organization's most recent events</CardDescription>
          </div>
          <Link href={`/manage/organization/${params.organization_id}/event/create`}>
            <Button size="sm" variant="outline">Create New</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <Link 
                key={event.id} 
                href={`/manage/organization/${params.organization_id}/event/${event.id}`}
                className="block"
              >
                <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.sessionCount} sessions</span>
                    </div>
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-2" />
                      <span>0 tickets sold</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No events found.</p>
            <p className="text-sm">Create your first event to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionStatus } from "@/types/enums/sessionStatus";
import { OrganizationSessionDTO } from "@/lib/actions/statsActions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SessionsTableProps {
  sessions: OrganizationSessionDTO[];
  isLoading: boolean;
}

export const SessionsTable = ({
  sessions,
  isLoading
}: SessionsTableProps) => {
  const params = useParams<{ organization_id: string }>();
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get badge color based on session status
  const getSessionStatusBadge = (status: SessionStatus) => {
    switch(status) {
      case SessionStatus.ON_SALE:
        return <Badge className="bg-success text-success-foreground">On Sale</Badge>;
      case SessionStatus.SCHEDULED:
        return <Badge className="bg-primary text-primary-foreground">Scheduled</Badge>;
      case SessionStatus.PENDING:
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case SessionStatus.SOLD_OUT:
        return <Badge className="bg-secondary text-secondary-foreground">Sold Out</Badge>;
      case SessionStatus.CLOSED:
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      case SessionStatus.CANCELED:
        return <Badge className="bg-destructive text-destructive-foreground">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Sessions scheduled in the near future</CardDescription>
          </div>
          <Link href={`/manage/organization/${params.organization_id}`}>
            <Button size="sm" variant="outline">View All</Button>
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
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link 
                key={session.sessionId} 
                href={`/manage/organization/${params.organization_id}/event/${session.eventId}/sessions/${session.sessionId}`}
                className="block"
              >
                <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{session.eventTitle}</h3>
                    {getSessionStatusBadge(session.sessionStatus)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Start:</span> {formatDate(session.startTime)}
                    </div>
                    <div>
                      <span className="font-medium">Sales Start:</span> {formatDate(session.salesStartTime)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming sessions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
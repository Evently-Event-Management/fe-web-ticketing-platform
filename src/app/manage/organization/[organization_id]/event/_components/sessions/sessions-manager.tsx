"use client"

import * as React from 'react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, Clock, LinkIcon, MapPin, Share2, MoreHorizontal, 
  Edit, Trash2, Users, Layers, AlertTriangle, RefreshCcw, Plus 
} from 'lucide-react';
import { toast } from 'sonner';
import { useEventContext } from '@/providers/EventProvider';
import { SessionDetailDTO } from '@/lib/validators/event';
import { SessionType } from '@/types/enums/sessionType';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionDetailDTO;
}

// Simple placeholder share dialog
const SessionShareDialog: React.FC<SessionShareDialogProps> = ({ 
  open, 
  onOpenChange,
  session 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share Session</AlertDialogTitle>
          <AlertDialogDescription>
            Share the session details for {format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}.
            (This is a placeholder dialog)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Copy Link</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface SessionCardProps {
  session: SessionDetailDTO;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const handleEdit = () => {
    // Placeholder for edit functionality
    toast.info(`Edit session ${session.id} (Dummy function)`);
  };

  const handleDelete = () => {
    // Placeholder for delete functionality
    toast.info(`Delete session ${session.id} (Dummy function)`);
  };
  
  const startDate = parseISO(session.startTime);
  const endDate = parseISO(session.endTime);
  const isOnline = session.sessionType === SessionType.ONLINE;

  // Calculate event duration
  const getDuration = (): string => {
    try {
      const durationMs = endDate.getTime() - startDate.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      return hours > 0
        ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
        : `${minutes}m`;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return "N/A";
    }
  };

  const { event } = useEventContext();
  
  // Get seating summary by tier
  const getSeatingDetails = () => {
    if (!session.layoutData?.layout?.blocks?.length) return {
      byType: [],
      byTier: []
    };
    
    const blocks = session.layoutData.layout.blocks;
    const byTier: {tier: string; count: number; color?: string}[] = [];
    
    // Count sellable seats/capacity
    let standingCount = 0;
    let seatedCount = 0;
    let nonSellableCount = 0;
    
    // Create map of tier counts
    const tierCounts = new Map<string, number>();
    
    blocks.forEach(block => {
      if (block.type === 'standing_capacity' && block.capacity) {
        standingCount += block.capacity;
        
        // We don't have tierId on blocks directly, but we can potentially count all standing capacity
        // toward specific tiers if needed in the future
      } else if (block.type === 'seated_grid') {
        // Count seats in rows and group by tier
        if (block.rows?.length) {
          block.rows.forEach(row => {
            row.seats.forEach(seat => {
              seatedCount++;
              if (seat.tierId) {
                tierCounts.set(seat.tierId, (tierCounts.get(seat.tierId) || 0) + 1);
              }
            });
          });
        }
        
        // Count direct seats and group by tier
        if (block.seats?.length) {
          block.seats.forEach(seat => {
            seatedCount++;
            if (seat.tierId) {
              tierCounts.set(seat.tierId, (tierCounts.get(seat.tierId) || 0) + 1);
            }
          });
        }
      } else if (block.type === 'non_sellable') {
        nonSellableCount++;
      }
    });
    
    // Convert tier counts to summary array with tier names and colors
    if (event?.tiers && tierCounts.size > 0) {
      for (const [tierId, count] of tierCounts.entries()) {
        const tier = event.tiers.find(t => t.id === tierId);
        if (tier) {
          byTier.push({
            tier: tier.name,
            count,
            color: tier.color
          });
        } else {
          byTier.push({
            tier: 'Unknown Tier',
            count
          });
        }
      }
    }
    
    return {
      byTier
    };
  };
  
  const seatingDetails = getSeatingDetails();

  return (
    <>
      <Card key={session.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">
                {format(startDate, "MMM d, yyyy")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </p>
              <Badge variant={isOnline ? "secondary" : "default"} className="ml-1">
                {isOnline ? 'Online' : 'Physical'}
              </Badge>
              <Badge 
                variant={
                  session.status === SessionStatus.SCHEDULED ? "outline" : 
                  session.status === SessionStatus.ON_SALE ? "success" : 
                  session.status === SessionStatus.CLOSED ? "destructive" : 
                  "secondary"
                }
              >
                {session.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Button
              type={'button'}
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="flex items-center w-full cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the session
                          on {format(startDate, "MMMM d, yyyy")} and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{getDuration()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Sales start on: {format(parseISO(session.salesStartTime), 'MMM d, h:mm a')}</span>
              </div>
            </div>
            
            {/* Detailed venue information */}
            <div className="mt-1 text-sm">
              {isOnline && session.venueDetails?.onlineLink ? (
                <div className="flex items-start gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <a href={session.venueDetails.onlineLink} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline break-all">
                    {session.venueDetails.onlineLink}
                  </a>
                </div>
              ) : (!isOnline && session.venueDetails?.address) ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    {session.venueDetails?.name || 'No venue'} | {session.venueDetails?.address}
                  </span>
                </div>
              ) : null}
            </div>
            
            {/* Seating tier summary */}
            {seatingDetails.byTier.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {seatingDetails.byTier.map((tier, index) => (
                  <Badge 
                    key={`tier-${index}`} 
                    variant="outline" 
                    className="bg-muted/30"
                    style={tier.color ? {
                      borderColor: tier.color,
                      backgroundColor: `${tier.color}20` // 20 = 12.5% opacity
                    } : {}}
                  >
                    {tier.tier}: {tier.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SessionShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        session={session}
      />
    </>
  );
};

export const SessionsManager: React.FC = () => {
  const { event, isLoading, error } = useEventContext();
  
  const handleCreateSession = () => {
    // Placeholder for create session functionality
    toast.info("Create new session (Dummy function)");
  };

  const handleRefresh = () => {
    // This would ideally call a refetch function similar to refetchDiscounts
    toast.info("Refreshing sessions data (Dummy function)");
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64 mb-4"/>
        <Skeleton className="h-6 w-96 mb-8"/>
        <Skeleton className="h-64 w-full"/>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive"/>
        </div>
        <h2 className="text-xl font-semibold text-destructive">
          Event not found
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            Create and manage sessions for {event.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
            Refresh
          </Button>
          <Button onClick={handleCreateSession}>
            <Plus className="h-4 w-4 mr-2"/>
            New Session
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full"/>
      ) : event && (!event.sessions || event.sessions.length === 0) ? (
        <div className="text-center p-8 border rounded-md">
          <p className="mb-4">No sessions found</p>
          <Button onClick={handleCreateSession} variant="outline">
            Create your first session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {event.sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};
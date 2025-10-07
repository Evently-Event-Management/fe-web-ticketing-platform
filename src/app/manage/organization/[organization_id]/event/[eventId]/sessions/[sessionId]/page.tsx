'use client'

import React, { useState } from 'react';
import { useEventContext } from "@/providers/EventProvider";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Calendar, Clock, LinkIcon, MapPin, Share2, Tag, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionType } from "@/types/enums/sessionType";
import { SessionStatus } from "@/types/enums/sessionStatus";
import dynamic from "next/dynamic";
import { 
    deleteSession, 
    updateSessionLayout, 
    updateSessionStatus, 
    updateSessionTime, 
    updateSessionVenue,
    SessionTimeUpdateRequest,
    SessionStatusUpdateRequest,
    SessionLayoutUpdateRequest,
    SessionVenueUpdateRequest
} from "@/lib/actions/sessionActions";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SessionSeatingLayout } from "./_components/SessionSeatingLayout";
import { SeatingCapacitySummary } from "./_components/seatingCapacitySummary";
import { getSalesWindowDuration, getSalesStartTimeDisplay } from '@/lib/utils';

// Import edit dialogs
import { EditTimeDialog } from './_components/EditTimeDialog';
import { LocationEditDialog } from './_components/LocationEditDialog';
import { EditLayoutDialog } from './_components/EditLayoutDialog';
import { ChangeStatusDialog } from './_components/ChangeStatusDialog';

// Dynamically import the new VenueMap component
const VenueMap = dynamic(
    () => import('./_components/VenueMap'),
    { ssr: false }
);

// Helper function to get status badge variant and color
const getStatusProperties = (status: string | undefined) => {
    switch (status) {
        case SessionStatus.PENDING:
            return { variant: "outline" as const, color: "text-amber-500", icon: AlertTriangle };
        case SessionStatus.SCHEDULED:
            return { variant: "secondary" as const, color: "text-blue-500", icon: Calendar };
        case SessionStatus.ON_SALE:
            return { variant: "default" as const, color: "text-green-500", icon: Tag };
        case SessionStatus.SOLD_OUT:
            return { variant: "secondary" as const, color: "text-purple-500", icon: Tag };
        case SessionStatus.CLOSED:
            return { variant: "outline" as const, color: "text-gray-500", icon: Clock };
        case SessionStatus.CANCELED:
            return { variant: "destructive" as const, color: "text-destructive", icon: AlertTriangle };
        default:
            return { variant: "outline" as const, color: "text-muted-foreground", icon: Calendar };
    }
};

const SessionPage = () => {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const organizationId = params.organization_id as string;
    const router = useRouter();
    const { event, refetchEventData } = useEventContext();
    
    // Dialog states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditTimeDialogOpen, setIsEditTimeDialogOpen] = useState(false);
    const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false);
    const [isEditLayoutDialogOpen, setIsEditLayoutDialogOpen] = useState(false);
    const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
    
    // Operation states
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!event) {
        return (
            <div className="p-8 text-center w-full">
                Event Not Found
            </div>
        );
    }

    const session = event.sessions.find(s => s.id === sessionId);

    if (!session) {
        return (
            <div className="p-8 text-center w-full">
                Session Not Found
            </div>
        );
    }

    const startDate = parseISO(session.startTime);
    const endDate = parseISO(session.endTime);
    const salesStartDate = session.salesStartTime ? parseISO(session.salesStartTime) : null;
    const isOnline = session.sessionType === SessionType.ONLINE;
    const { venueDetails, layoutData, status } = session;
    const statusProps = getStatusProperties(status);

    // For the map - set default to Colombo if no coordinates
    const mapCenter: [number, number] =
        venueDetails?.latitude && venueDetails?.longitude
            ? [venueDetails.latitude, venueDetails.longitude]
            : [6.9271, 79.8612]; // Default to Colombo

    // Calculate event duration
    const getDuration = () => {
        const durationMs = endDate.getTime() - startDate.getTime();
        const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? `, ${hours} hour${hours !== 1 ? 's' : ''}` : ''}${minutes > 0 ? `, ${minutes} min` : ''}`;
        } else if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? `, ${minutes} min` : ''}`;
        } else {
            return `${minutes} minutes`;
        }
    };

    // Handle share
    const handleShare = async () => {
        try {
            const shareUrl = window.location.href;
            if (navigator.share) {
                await navigator.share({
                    title: `${event.title} - ${format(startDate, 'MMM d, yyyy')}`,
                    text: `Join us for ${event.title} on ${format(startDate, 'EEEE, MMMM d, yyyy')}`,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Session URL copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Handle session time update
    const handleTimeUpdate = async (timeData: SessionTimeUpdateRequest) => {
        try {
            setIsSaving(true);
            await updateSessionTime(sessionId, timeData);
            toast.success('Session time updated successfully');
            await refetchEventData();
            setIsEditTimeDialogOpen(false);
        } catch (error) {
            console.error('Error updating session time:', error);
            toast.error('Failed to update session time');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle location/venue update
    const handleVenueUpdate = async (venueDetails: any) => {
        try {
            setIsSaving(true);
            await updateSessionVenue(sessionId, { venueDetails });
            toast.success('Venue details updated successfully');
            await refetchEventData();
            setIsEditLocationDialogOpen(false);
        } catch (error) {
            console.error('Error updating venue details:', error);
            toast.error('Failed to update venue details');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle layout update
    const handleLayoutUpdate = async (layoutData: SessionLayoutUpdateRequest) => {
        try {
            setIsSaving(true);
            await updateSessionLayout(sessionId, layoutData);
            toast.success('Seating layout updated successfully');
            await refetchEventData();
            setIsEditLayoutDialogOpen(false);
        } catch (error) {
            console.error('Error updating seating layout:', error);
            toast.error('Failed to update seating layout');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle status change
    const handleStatusUpdate = async (statusData: SessionStatusUpdateRequest) => {
        try {
            setIsSaving(true);
            await updateSessionStatus(sessionId, statusData);
            toast.success(`Session status updated to ${statusData.status}`);
            await refetchEventData();
            setIsChangeStatusDialogOpen(false);
        } catch (error) {
            console.error('Error updating session status:', error);
            toast.error('Failed to update session status');
        } finally {
            setIsSaving(false);
        }
    };
    
    // Handle delete
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteSession(sessionId);
            toast.success('Session deleted successfully');
            router.push(`/manage/organization/${params.organization_id}/event/${params.eventId}`);
            await refetchEventData();
        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete session');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };
    
    // Business logic for edit permissions
    const canEditTime = session?.status === SessionStatus.SCHEDULED || 
                       (session?.status === SessionStatus.ON_SALE && new Date(session.startTime) > new Date());
                       
    const canEditVenue = session?.status === SessionStatus.SCHEDULED;
    
    const canEditLayout = session?.status === SessionStatus.SCHEDULED;
    
    const canDelete = session?.status === SessionStatus.SCHEDULED;
    
    const canChangeStatus = session?.status === SessionStatus.SCHEDULED || 
                           session?.status === SessionStatus.ON_SALE;

    return (
        <div className="space-y-6 p-6">
            {/* Action buttons and header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                        {isOnline ?
                                            <LinkIcon className="h-5 w-5 text-blue-500" /> :
                                            <MapPin className="h-5 w-5 text-emerald-500" />
                                        }
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isOnline ? 'Online Session' : 'Physical Session'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <h1 className="text-2xl font-semibold">{event.title}</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {startDate.toDateString() === endDate.toDateString()
                            ? `Session on ${format(startDate, 'EEEE, MMMM d, yyyy')}`
                            : `Session from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`
                        }
                    </p>
                </div>
                <div className="flex space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleShare}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Share Session</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {canDelete && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        size="icon"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete Session</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Status banner */}
            <div className={`w-full p-3 mb-4 rounded-md flex items-center gap-3 bg-muted/30 border ${status === SessionStatus.CANCELED ? 'border-destructive' : ''}`}>
                <div className={`p-2 rounded-full ${statusProps.color} bg-muted`}>
                    {React.createElement(statusProps.icon, { className: "h-5 w-5" })}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                        Session Status:
                        <Badge variant={statusProps.variant} className="text-sm">
                            {status || 'PENDING'}
                        </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {status === SessionStatus.PENDING && "This session is pending and can be edited."}
                        {status === SessionStatus.SCHEDULED && "This session is scheduled and some fields can still be edited."}
                        {status === SessionStatus.ON_SALE && "This session is on sale. Limited editing is available."}
                        {status === SessionStatus.SOLD_OUT && "This session is sold out. Limited editing is available."}
                        {status === SessionStatus.CLOSED && "This session is closed and can't be edited."}
                        {status === SessionStatus.CANCELED && "This session has been canceled."}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Session Metadata Section */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Session Details</CardTitle>
                    {canEditTime && (
                        <Button 
                            onClick={() => setIsEditTimeDialogOpen(true)}
                            variant="outline"
                            size="sm"
                        >
                            Edit Times
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Start Time</div>
                            <div>{format(startDate, 'EEEE, MMMM d, yyyy h:mm a')}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">End Time</div>
                            <div>{format(endDate, 'EEEE, MMMM d, yyyy h:mm a')}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div>{getDuration()}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Sales Start</div>
                            <div>{salesStartDate ? format(salesStartDate, 'MMM d, yyyy h:mm a') : 'Not set'}</div>
                        </div>
                        {salesStartDate && (
                            <div className="space-y-2 col-span-full">
                                <div className="text-sm text-muted-foreground">Sales Window</div>
                                <div>{getSalesWindowDuration(session.salesStartTime, session.startTime)}</div>
                            </div>
                        )}
                    </div>
                    
                    {(canChangeStatus || session.status !== SessionStatus.CANCELED) && (
                        <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="text-sm font-medium mb-1">Session Status</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={statusProps.variant}>
                                        {session.status?.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {session.status === SessionStatus.SCHEDULED && salesStartDate && 
                                            getSalesStartTimeDisplay(session.salesStartTime)}
                                    </span>
                                </div>
                            </div>
                            {canChangeStatus && (
                                <Button
                                    onClick={() => setIsChangeStatusDialogOpen(true)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Change Status
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Venue Information Section */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>
                        {isOnline ? 'Online Event Information' : 'Venue Information'}
                    </CardTitle>
                    {canEditVenue && (
                        <Button
                            onClick={() => setIsEditLocationDialogOpen(true)}
                            variant="outline"
                            size="sm"
                        >
                            Edit {isOnline ? 'Online Link' : 'Venue'}
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isOnline ? (
                        <div>
                            {venueDetails?.onlineLink ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Online Meeting Link</div>
                                        <a 
                                            href={venueDetails.onlineLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <LinkIcon size={16} />
                                            {venueDetails.onlineLink}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground">
                                    No online link has been provided for this session.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Venue Name</div>
                                    <div>{venueDetails?.name || 'Not specified'}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Address</div>
                                    <div>{venueDetails?.address || 'Not specified'}</div>
                                </div>
                            </div>
                            
                            {/* Map */}
                            <div className="h-[300px] w-full rounded-md border overflow-hidden relative">
                                {venueDetails?.latitude && venueDetails?.longitude ? (
                                    <VenueMap 
                                        center={mapCenter}
                                        venueName={venueDetails?.name || 'Event Location'}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-muted/30">
                                        <div className="text-center p-4">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-muted-foreground">No location coordinates specified</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

                        {/* Seating Layout Section */}
            {!isOnline && layoutData && layoutData.layout.blocks.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Seating Layout</CardTitle>
                        {canEditLayout && (
                            <Button
                                onClick={() => setIsEditLayoutDialogOpen(true)}
                                variant="outline"
                                size="sm"
                            >
                                Edit Layout
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <SessionSeatingLayout
                            session={session}
                            tiers={event.tiers}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Edit Time Dialog */}
            <EditTimeDialog
                open={isEditTimeDialogOpen}
                onOpenChange={setIsEditTimeDialogOpen}
                initialData={{
                    startTime: session.startTime,
                    endTime: session.endTime,
                    salesStartTime: session.salesStartTime,
                    status: session.status
                }}
                onSave={handleTimeUpdate}
            />
            
            {/* Edit Location Dialog */}
            <LocationEditDialog
                open={isEditLocationDialogOpen}
                onOpenChange={setIsEditLocationDialogOpen}
                sessionType={session.sessionType}
                initialData={venueDetails}
                onSave={handleVenueUpdate}
                sessionIndex={0}
            />
            
            {/* Edit Layout Dialog */}
            <EditLayoutDialog
                open={isEditLayoutDialogOpen}
                onOpenChange={setIsEditLayoutDialogOpen}
                initialLayout={layoutData}
                sessionType={session.sessionType}
                tiers={event.tiers}
                organizationId={organizationId}
                onSave={handleLayoutUpdate}
            />
            
            {/* Change Status Dialog */}
            <ChangeStatusDialog
                open={isChangeStatusDialogOpen}
                onOpenChange={setIsChangeStatusDialogOpen}
                currentStatus={session.status}
                onSave={handleStatusUpdate}
            />
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Session</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this session? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SessionPage;
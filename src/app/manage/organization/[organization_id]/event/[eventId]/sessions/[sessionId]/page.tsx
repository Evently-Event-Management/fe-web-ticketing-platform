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
import { deleteSession } from "@/lib/actions/sessionActions";
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
    const router = useRouter();
    const { event, refetchEventData } = useEventContext();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={status === SessionStatus.ON_SALE || status === SessionStatus.SOLD_OUT}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
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
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Session Information
                    </CardTitle>
                    <Badge
                        variant={statusProps.variant}
                        className="text-xs sm:text-sm mt-2 sm:mt-0"
                    >
                        {React.createElement(statusProps.icon, { className: "h-3 w-3 mr-1 inline" })}
                        {status || 'PENDING'}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Start Time</div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{format(startDate, 'EEEE, MMMM d, yyyy h:mm a')}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">End Time</div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{format(endDate, 'EEEE, MMMM d, yyyy h:mm a')}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Duration</div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{getDuration()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Sales Start Time</div>
                                {salesStartDate ? (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span>{format(salesStartDate, 'MMM d, yyyy h:mm a')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Sales start time not set
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Venue Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                        {isOnline ? (
                                            <LinkIcon className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <MapPin className="h-5 w-5 text-emerald-500" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isOnline ? 'Online Session' : 'Physical Session'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {isOnline ? 'Online Event Details' : 'Venue Details'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isOnline ? (
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Online Link</div>
                            {venueDetails?.onlineLink ? (
                                <div className="break-all">{venueDetails.onlineLink}</div>
                            ) : (
                                <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        Online link not provided
                                    </AlertDescription>
                                </Alert>
                            )}
                            {/* Capacity summary for online events */}
                            {layoutData && layoutData.layout.blocks.length > 0 && (
                                <div className="mt-4">
                                    <SeatingCapacitySummary
                                        session={session}
                                        tiers={event.tiers || []}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Venue Name</div>
                                        {venueDetails?.name ? (
                                            <div className="font-medium">{venueDetails.name}</div>
                                        ) : (
                                            <div className="text-destructive">Not specified</div>
                                        )}
                                    </div>

                                    {venueDetails?.address && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Address</div>
                                            <div>{venueDetails.address}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Map for physical events */}
                                <div className="h-[300px] rounded-md overflow-hidden border">
                                    <VenueMap
                                        center={mapCenter}
                                        venueName={venueDetails?.name || "Event Venue"}
                                    />
                                </div>
                            </div>

                            {/* Add a note about the map */}
                            <div className="text-xs text-muted-foreground mt-2 italic">
                                Map shows approximate location based on venue coordinates
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Seating Layout Section */}
            {!isOnline && layoutData && layoutData.layout.blocks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Seating Layout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full">
                            <SessionSeatingLayout
                                session={session}
                                tiers={event.tiers || []}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the session
                            and all its associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SessionPage;
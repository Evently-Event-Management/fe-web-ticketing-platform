'use client'

import React, { useState } from 'react';
import { useEventContext } from "@/providers/EventProvider";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Calendar, Clock, Tag } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { SessionType } from "@/types/enums/sessionType";
import { SessionStatus } from "@/types/enums/sessionStatus";
import { 
    deleteSession, 
    updateSessionStatus, 
    updateSessionTime, 
    updateSessionVenue,
    SessionTimeUpdateRequest,
    SessionStatusUpdateRequest,
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

// Import page components
import { 
    SessionHeader, 
    StatusBanner, 
    SessionMetadata, 
    VenueInformation, 
    SeatingLayoutSection 
} from './_components';

// Import edit dialogs
import { EditTimeDialog } from './_components/EditTimeDialog';
import { LocationEditDialog } from './_components/LocationEditDialog';
import { ChangeStatusDialog } from './_components/ChangeStatusDialog';

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
    const { event, refetchSession } = useEventContext();
    
    // Dialog states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditTimeDialogOpen, setIsEditTimeDialogOpen] = useState(false);
    const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false);
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
            await refetchSession(sessionId);
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
            await refetchSession(sessionId);
            setIsEditLocationDialogOpen(false);
        } catch (error) {
            console.error('Error updating venue details:', error);
            toast.error('Failed to update venue details');
        } finally {
            setIsSaving(false);
        }
    };

    // Layout update is now handled in a separate page

    // Handle status change
    const handleStatusUpdate = async (statusData: SessionStatusUpdateRequest) => {
        try {
            setIsSaving(true);
            await updateSessionStatus(sessionId, statusData);
            toast.success(`Session status updated to ${statusData.status}`);
            await refetchSession(sessionId);
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
            await refetchSession(sessionId);
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
            <SessionHeader
                title={event.title}
                startDate={startDate}
                endDate={endDate}
                isOnline={isOnline}
                canDelete={canDelete}
                onShare={handleShare}
                onDelete={() => setIsDeleteDialogOpen(true)}
            />

            {/* Status banner */}
            <StatusBanner
                status={status}
                statusProps={statusProps}
                salesStartDate={salesStartDate}
            />

            <Separator />

            {/* Session Metadata Section */}
            <SessionMetadata
                startDate={startDate}
                endDate={endDate}
                salesStartDate={salesStartDate}
                status={status}
                statusProps={statusProps}
                salesStartTime={session.salesStartTime}
                startTime={session.startTime}
                canEditTime={canEditTime}
                canChangeStatus={canChangeStatus}
                onEditTime={() => setIsEditTimeDialogOpen(true)}
                onChangeStatus={() => setIsChangeStatusDialogOpen(true)}
                getDuration={getDuration}
            />

            {/* Venue Information Section */}
            <VenueInformation
                isOnline={isOnline}
                venueDetails={venueDetails}
                canEditVenue={canEditVenue}
                onEditVenue={() => setIsEditLocationDialogOpen(true)}
            />

            {/* Seating Layout Section */}
            {!isOnline && layoutData && layoutData.layout.blocks.length > 0 && (
                <SeatingLayoutSection
                    session={session}
                    tiers={event.tiers}
                    canEditLayout={canEditLayout}
                />
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
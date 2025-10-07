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
import { SessionType } from "@/types/enums/sessionType";
import dynamic from "next/dynamic";
import { deleteSession } from "@/lib/actions/sessionActions";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
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

// Dynamically load just the map component for venue details
const VenueMap = dynamic(
    () => import("react-leaflet").then(mod => {
        // Create a custom component that just renders the map
        const MapComponent = ({ center, venueName }: { center: [number, number], venueName: string }) => {
            const { MapContainer, TileLayer, Marker, Popup } = mod;
            
            // Fix default marker icons (required for Leaflet in Next.js)
            React.useEffect(() => {
                const L = require("leaflet");
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
                });
            }, []);
            
            return (
                <MapContainer
                    center={center}
                    zoom={15}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={center}>
                        <Popup>{venueName || "Event Venue"}</Popup>
                    </Marker>
                </MapContainer>
            );
        };
        return MapComponent;
    }),
    { ssr: false }
);

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
    const { venueDetails, layoutData } = session;
    
    // For the map - set default to Colombo if no coordinates
    const mapCenter: [number, number] = 
        venueDetails?.latitude && venueDetails?.longitude
            ? [venueDetails.latitude, venueDetails.longitude]
            : [6.9271, 79.8612]; // Default to Colombo

    // Calculate event duration
    const getDuration = () => {
        const durationMs = endDate.getTime() - startDate.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return hours > 0
            ? `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
            : `${minutes} minutes`;
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
                        <h1 className="text-2xl font-semibold">{event.title}</h1>
                        <Badge variant={isOnline ? "secondary" : "default"}>
                            {isOnline ? 'Online' : 'Physical'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Session on {format(startDate, 'EEEE, MMMM d, yyyy')}
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
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Session Metadata Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Session Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Date</div>
                                <div className="font-medium">{format(startDate, 'EEEE, MMMM d, yyyy')}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Start Time</div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(startDate, 'h:mm a')}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground">End Time</div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(endDate, 'h:mm a')}</span>
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
                        {isOnline ? (
                            <>
                                <LinkIcon className="h-5 w-5" />
                                Online Event Details
                            </>
                        ) : (
                            <>
                                <MapPin className="h-5 w-5" />
                                Venue Details
                            </>
                        )}
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
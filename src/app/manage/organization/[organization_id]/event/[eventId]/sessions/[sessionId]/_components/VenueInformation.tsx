'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the VenueMap component
const VenueMap = dynamic(
    () => import('./VenueMap'),
    { ssr: false }
);

interface VenueInformationProps {
    isOnline: boolean;
    venueDetails: {
        name?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        onlineLink?: string;
    };
    canEditVenue: boolean;
    onEditVenue: () => void;
}

export const VenueInformation: React.FC<VenueInformationProps> = ({
    isOnline,
    venueDetails,
    canEditVenue,
    onEditVenue
}) => {
    // For the map - set default to Colombo if no coordinates
    const mapCenter: [number, number] =
        venueDetails?.latitude && venueDetails?.longitude
            ? [venueDetails.latitude, venueDetails.longitude]
            : [6.9271, 79.8612]; // Default to Colombo

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>
                    {isOnline ? 'Online Event Information' : 'Venue Information'}
                </CardTitle>
                {canEditVenue && (
                    <Button
                        onClick={onEditVenue}
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
    );
};
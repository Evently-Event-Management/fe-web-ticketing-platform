'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon, MapPin, Building2, Navigation, Pencil } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the VenueMap component
const VenueMap = dynamic(
    () => import('./VenueMap'),
    { ssr: false }
);

// A small helper component for consistent display of information items
const InfoItem = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-sm text-muted-foreground">{children}</span>
        </div>
    </div>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                <div className="flex items-center gap-3">
                    {isOnline ? (
                        <LinkIcon className="h-6 w-6 text-primary" />
                    ) : (
                        <MapPin className="h-6 w-6 text-primary" />
                    )}
                    <CardTitle className="text-lg">
                        {isOnline ? 'Online Event' : 'Venue Details'}
                    </CardTitle>
                </div>
                {canEditVenue && (
                    <Button 
                        onClick={onEditVenue} 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Edit {isOnline ? 'Online Link' : 'Venue'}</span>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isOnline ? (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">ONLINE DETAILS</h3>
                            {venueDetails?.onlineLink ? (
                                <InfoItem icon={LinkIcon} label="Meeting Link">
                                    <a 
                                        href={venueDetails.onlineLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {venueDetails.onlineLink}
                                    </a>
                                </InfoItem>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No online link has been provided for this session.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">VENUE DETAILS</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                <InfoItem icon={Building2} label="Venue Name">
                                    {venueDetails?.name || 'Not specified'}
                                </InfoItem>
                                <InfoItem icon={MapPin} label="Address">
                                    {venueDetails?.address || 'Not specified'}
                                </InfoItem>
                                {venueDetails?.latitude && venueDetails?.longitude && (
                                    <InfoItem icon={Navigation} label="Coordinates">
                                        {venueDetails.latitude.toFixed(6)}, {venueDetails.longitude.toFixed(6)}
                                    </InfoItem>
                                )}
                            </div>
                        </div>
                        
                        {/* Map */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">LOCATION MAP</h3>
                            <div className="h-[250px] w-full rounded-md border overflow-hidden relative">
                                {venueDetails?.latitude && venueDetails?.longitude ? (
                                    <VenueMap 
                                        center={mapCenter}
                                        venueName={venueDetails?.name || 'Event Location'}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-muted/10">
                                        <div className="text-center p-4">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">No location coordinates specified</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
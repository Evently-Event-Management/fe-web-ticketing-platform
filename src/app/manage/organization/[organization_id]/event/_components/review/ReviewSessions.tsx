'use client';

import * as React from 'react';
import {format, parseISO} from 'date-fns';
import {Calendar, MapPin, Tag, Users, Clock, Armchair, LinkIcon} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {Badge} from '@/components/ui/badge';
import {
    SessionFormData,
    SalesStartRuleType,
    SessionType,
    Seat,
    Tier
} from '@/lib/validators/event';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {GoogleMap, useJsApiLoader, Marker} from '@react-google-maps/api';

interface ReviewSessionsProps {
    sessions: SessionFormData[];
    tiers: Tier[];
}

export const ReviewSessions: React.FC<ReviewSessionsProps> = ({sessions, tiers}) => {
    if (sessions.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Schedule</h2>
            <Accordion type="single" collapsible className="w-full">
                {sessions.map((session, index) => (
                    <SessionAccordionItem
                        key={`session-${index}`}
                        session={session}
                        index={index}
                        tiers={tiers}
                    />
                ))}
            </Accordion>
        </div>
    );
};

interface SessionAccordionItemProps {
    session: SessionFormData;
    tiers: Tier[];
    index: number;
}

const SessionAccordionItem: React.FC<SessionAccordionItemProps> = ({session, index, tiers}) => {
    const startDate = parseISO(session.startTime);
    const endDate = parseISO(session.endTime);
    const isOnline = session.sessionType === SessionType.ONLINE;
    const {layoutData} = session;

    return (
        <AccordionItem
            value={`item-${index}`}
            className="border rounded-lg mb-4 overflow-hidden"
        >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/40">
                <div className="flex items-center gap-3 text-left">
                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <div className="font-medium">
                            {format(startDate, "EEEE, MMMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                        </div>
                    </div>
                    <Badge variant={isOnline ? "secondary" : "default"} className="ml-4">
                        {isOnline ? 'Online' : 'Physical'}
                    </Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
                <div className="grid grid-cols-1 gap-6">
                    <SessionDetails session={session}/>
                    {layoutData && layoutData.layout.blocks.length > 0 && (
                        <SeatingInformation
                            isOnline={isOnline}
                            session={session}
                            tiers={tiers}
                        />
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

interface SessionDetailsProps {
    session: SessionFormData;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({session}) => {
    const startDate = parseISO(session.startTime);
    const endDate = parseISO(session.endTime);
    const isOnline = session.sessionType === SessionType.ONLINE;
    const {venueDetails} = session;

    // Calculate event duration
    const getDuration = (): string => {
        try {
            const durationMs = endDate.getTime() - startDate.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            return hours > 0
                ? `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
                : `${minutes} minutes`;
        } catch (e) {
            console.error("Error calculating duration:", e);
            return "Duration unavailable";
        }
    };

    // Sales rule description
    const getSalesRuleDescription = (): string => {
        switch (session.salesStartRuleType) {
            case SalesStartRuleType.IMMEDIATE:
                return "On sale immediately";
            case SalesStartRuleType.FIXED:
                return session.salesStartFixedDatetime
                    ? `Sales start on ${format(parseISO(session.salesStartFixedDatetime), 'MMM d, yyyy h:mm a')}`
                    : "Fixed date not set";
            case SalesStartRuleType.ROLLING:
                if (session.salesStartHoursBefore === undefined || session.salesStartHoursBefore === null || session.salesStartHoursBefore < 0) {
                    return "Rolling hours not set or invalid";
                } else if (session.salesStartHoursBefore < 24) {
                    return `Sales start ${session.salesStartHoursBefore} hour(s) before the session`;
                } else {
                    const days = Math.floor(session.salesStartHoursBefore / 24);
                    const hours = session.salesStartHoursBefore % 24;
                    return `Sales start ${days} day(s)${hours > 0 ? ` and ${hours} hour(s)` : ''} before the session`;
                }
            default:
                return "Not set";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground"/>
                <span>Duration: {getDuration()}</span>
            </div>

            <div className="flex items-start gap-2">
                {isOnline ? (
                    <>
                        <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5"/>
                        <div>
                            <div>Online Event</div>
                            {venueDetails?.onlineLink ? (
                                <div className="text-sm text-muted-foreground break-all">
                                    {venueDetails.onlineLink}
                                </div>
                            ) : (
                                <div className="text-sm text-destructive">
                                    Link not provided
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                        <div className="w-full">
                            {venueDetails?.name ? (
                                <>
                                    <div>{venueDetails.name}</div>
                                    {venueDetails.address && (
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {venueDetails.address}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-destructive">
                                    Venue not specified
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground"/>
                <span>{getSalesRuleDescription()}</span>
            </div>
        </div>
    );
};

interface SeatingInformationProps {
    isOnline: boolean;
    session: SessionFormData;
    tiers: Tier[];
}

const SeatingInformation: React.FC<SeatingInformationProps> = ({isOnline, session, tiers}) => {
    const {layoutData} = session;
    const {venueDetails} = session;

    // For physical events with coordinates, prepare Google Map
    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    const mapCenter = venueDetails?.latitude && venueDetails?.longitude
        ? {lat: venueDetails.latitude, lng: venueDetails.longitude}
        : {lat: 6.9271, lng: 79.8612}; // Default: Colombo, Sri Lanka

    // Function to count seats by tier
    const getSeatCountByTier = () => {
        const tierCounts: Record<string, number> = {};

        layoutData.layout.blocks.forEach(block => {
            if (block.rows) {
                // For seated blocks with rows
                block.rows.forEach(row => {
                    row.seats.forEach(seat => {
                        if (seat.status !== 'RESERVED') {
                            const tierId = seat.tierId || 'unassigned';
                            tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                        }
                    });
                });
            } else if (block.seats) {
                // For blocks with direct seats array
                block.seats.forEach(seat => {
                    if (seat.status !== 'RESERVED') {
                        const tierId = seat.tierId || 'unassigned';
                        tierCounts[tierId] = (tierCounts[tierId] || 0) + 1;
                    }
                });
            } else if (block.capacity && block.type === 'standing_capacity') {
                // For standing blocks
                // Fix the TypeScript error by explicitly typing the block.seats access
                const blockSeats = block.seats as Seat[] | undefined;
                const tierId = blockSeats?.[0]?.tierId || 'unassigned';
                tierCounts[tierId] = (tierCounts[tierId] || 0) + (block.capacity || 0);
            }
        });

        return tierCounts;
    };

    const seatCountByTier = getSeatCountByTier();
    const totalSeats = Object.values(seatCountByTier).reduce((sum, count) => sum + count, 0);

    // Display for online events
    if (isOnline) {
        return (
            <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5"/>
                    <span className="font-medium">Capacity Information</span>
                </div>
                <div className="text-sm ml-6">
                    <p>Total capacity: {totalSeats}</p>
                    {Object.entries(seatCountByTier).map(([tierId, count]) => (
                        <div key={tierId} className="flex items-center gap-2 mt-1">
                            {tierId !== 'unassigned' && (
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: getTierColor(tierId, session, tiers)
                                    }}
                                />
                            )}
                            <span>
                                {getTierName(tierId, session, tiers)}: {count} {count === 1 ? 'seat' : 'seats'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Display for physical events - side by side layout
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Venue & Seating Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: Google Map */}
                <div className="h-[300px] rounded-md overflow-hidden border">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{
                                width: '100%',
                                height: '100%',
                            }}
                            center={mapCenter}
                            zoom={15}
                        >
                            <Marker position={mapCenter}/>
                        </GoogleMap>
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Loading map...</p>
                        </div>
                    )}
                </div>

                {/* Right side: Seating summary */}
                <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                            <Armchair className="h-4 w-4 text-muted-foreground mt-0.5"/>
                            <span className="font-medium">Seating Summary</span>
                        </div>
                        <div className="text-sm ml-6">
                            <p>Total capacity: {totalSeats}</p>
                            {Object.entries(seatCountByTier).map(([tierId, count]) => (
                                <div key={tierId} className="flex items-center gap-2 mt-1">
                                    {tierId !== 'unassigned' && (
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: getTierColor(tierId, session, tiers)
                                            }}
                                        />
                                    )}
                                    <span>
                                        {getTierName(tierId, session, tiers)}: {count} {count === 1 ? 'seat' : 'seats'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seating Layout below the map and summary */}
            {layoutData && (
                <SeatingLayout session={session} tiers={tiers}/>
            )}
        </div>
    );
};

// Helper to get tier color
const getTierColor = (tierId: string, session: SessionFormData, tiers: Tier[]): string => {
    if (tierId === 'unassigned') return '#d1d5db'; // gray-300

    // We need to check if tiers exist in the session
    const tier = tiers.find(t => t.id === tierId);
    return tier?.color || '#6b7280'; // gray-500 as fallback
};

// Helper to get tier name
const getTierName = (tierId: string, session: SessionFormData, tiers: Tier[]): string => {
    if (tierId === 'unassigned') return 'Unassigned';

    const tier = tiers.find(t => t.id === tierId);
    return tier?.name || 'Unknown Tier';
};

interface SeatingLayoutProps {
    session: SessionFormData;
    tiers: Tier[];
}

const SeatingLayout: React.FC<SeatingLayoutProps> = ({session, tiers}) => {
    // const [selectedSeat, setSelectedSeat] = useState<{
    //     seat: Seat;
    //     rowLabel?: string;
    //     blockName: string;
    //     tier?: string;
    // } | null>(null);

    const {layoutData} = session;

    // Only render for physical events with layout data
    if (!layoutData || session.sessionType !== SessionType.PHYSICAL) return null;

    // const handleSeatClick = (
    //     seat: Seat,
    //     blockName: string,
    //     rowLabel?: string
    // ) => {
    //     setSelectedSeat({
    //         seat,
    //         rowLabel,
    //         blockName,
    //         tier: seat.tierId ? getTierName(seat.tierId, session, tiers) : undefined
    //     });
    // };

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Seating Layout</h3>
            <div className="relative bg-muted/30 min-h-[300px] p-4 rounded-lg overflow-auto">
                {layoutData.layout.blocks.map(block => (
                    <div
                        key={block.id}
                        className="absolute bg-card border rounded-lg p-3 shadow-sm"
                        style={{
                            left: block.position.x,
                            top: block.position.y,
                            width: block.width ? `${block.width}px` : 'auto',
                            height: block.height ? `${block.height}px` : 'auto'
                        }}
                    >
                        <div className="text-sm font-medium mb-1">{block.name}</div>

                        {block.type === 'seated_grid' && block.rows && (
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: `repeat(${block.rows[0]?.seats?.length || 1}, 1fr)`
                                }}
                            >
                                {block.rows.map(row =>
                                    row.seats.map(seat => (
                                        <Popover key={seat.id}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 rounded-full text-xs font-mono"
                                                    style={{
                                                        backgroundColor: seat.tierId ?
                                                            `${getTierColor(seat.tierId, session, tiers)}80` : // 50% opacity
                                                            undefined,
                                                        opacity: seat.status === 'RESERVED' ? 0.3 : 1
                                                    }}
                                                    // onClick={() => handleSeatClick(seat, block.name, row.label)}
                                                >
                                                    {seat.label}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent side="top" className="w-60 p-0">
                                                <div className="p-4">
                                                    <div className="font-semibold mb-2">Seat Information</div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Block:</span>
                                                            <span>{block.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Row:</span>
                                                            <span>{row.label}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Seat:</span>
                                                            <span>{seat.label}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Status:</span>
                                                            <Badge
                                                                variant={seat.status === 'RESERVED' ? 'destructive' : 'outline'}>
                                                                {seat.status || 'Available'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Tier:</span>
                                                            <div className="flex items-center gap-1">
                                                                {seat.tierId && (
                                                                    <div
                                                                        className="h-3 w-3 rounded-full"
                                                                        style={{
                                                                            backgroundColor: getTierColor(seat.tierId, session, tiers)
                                                                        }}
                                                                    />
                                                                )}
                                                                <span>
                                                                    {seat.tierId ? getTierName(seat.tierId, session, tiers) : 'Unassigned'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ))
                                )}
                            </div>
                        )}

                        {block.type === 'standing_capacity' && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-center">
                                    <span className="block font-medium">Standing Area</span>
                                    <span className="text-muted-foreground">
                                        Capacity: {block.capacity || 0}
                                    </span>
                                </p>
                            </div>
                        )}

                        {block.type === 'non_sellable' && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-muted-foreground">
                                    Non-sellable area
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

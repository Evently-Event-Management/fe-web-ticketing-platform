'use client';

import * as React from 'react';
import {format, parseISO} from 'date-fns';
import {Calendar, Clock, LinkIcon, MapPin, Tag} from 'lucide-react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {Badge} from '@/components/ui/badge';
import {SessionFormData, Tier} from '@/lib/validators/event';
import {Libraries} from '@react-google-maps/api';
import {SalesStartRuleType, SessionType} from "@/lib/validators/salesStartRuleType";
import {SeatingInformation} from "@/app/manage/_components/review/SeatingInformation";

interface ReviewSessionsProps {
    sessions: SessionFormData[];
    tiers: Tier[];
}

// Shared libraries configuration for Google Maps
const mapLibraries: Libraries = ["places", "maps"];

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


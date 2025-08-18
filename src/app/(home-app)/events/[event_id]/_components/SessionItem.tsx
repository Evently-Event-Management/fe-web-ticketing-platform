'use client'

import {SessionStatus, SessionType} from "@/lib/validators/enums";
import {AccordionContent, AccordionItem, AccordionTrigger, Accordion} from "@/components/ui/accordion";
import {CalendarIcon, Clock, MapPin} from "lucide-react";
import {SessionInfoBasicDTO, SessionSeatingMapDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {SessionMap} from "@/app/(home-app)/events/[event_id]/_components/SessionMap";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {SeatingLayout} from "@/app/(home-app)/events/[event_id]/_components/SeatingLayout";
import {useState} from "react";
import {getSessionSeatingMap} from "@/lib/actions/public/SessionActions";

export const SessionItem = ({session}: { session: SessionInfoBasicDTO }) => {
    const [seatingMap, setSeatingMap] = useState<SessionSeatingMapDTO | null>(null);
    const [isMapLoading, setIsMapLoading] = useState(false);

    const onOpen = (isOpen: boolean) => {
        if (isOpen && !seatingMap && session.sessionType === SessionType.PHYSICAL) {
            setIsMapLoading(true);
            console.log(`Accordion for session ${session.id} expanded. Fetching seating map...`);
            // Delay fetching slightly as requested
            setTimeout(() => {
                getSessionSeatingMap(session.id)
                    .then(data => setSeatingMap(data))
                    .catch(err => console.error("Failed to fetch seating map", err))
                    .finally(() => setIsMapLoading(false));
            }, 500);
        }
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusBadge: { [key in SessionStatus]: string } = {
        [SessionStatus.ON_SALE]: "bg-green-500/10 text-green-600",
        [SessionStatus.SOLD_OUT]: "bg-red-500/10 text-red-600",
        [SessionStatus.CANCELED]: "bg-slate-500/10 text-slate-600",
        [SessionStatus.SCHEDULED]: "bg-blue-500/10 text-blue-600",
        [SessionStatus.PENDING]: "bg-yellow-500/10 text-yellow-600",
    };


    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex justify-between items-center w-full mb-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-semibold text-foreground">{formatDate(session.startTime)}</span>
                        <Badge
                            className={`ml-2 ${statusBadge[session.status]}`}>{session.status.replace('_', ' ')}</Badge>
                    </div>
                    <div>
                        {session.status === SessionStatus.ON_SALE && <Button>Buy Tickets</Button>}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="h-4 w-4"/>
                    <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4"/>
                    <span>{session.venueDetails.name} - {session.sessionType === SessionType.PHYSICAL ? session.venueDetails.address :
                        <a href={session.venueDetails.onlineLink} target="_blank" rel="noreferrer"
                           className="text-primary underline">Online Link</a>}</span>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible onValueChange={(value) => onOpen(!!value)}>
                    <AccordionItem value={session.id} className="border-b-0">
                        <AccordionTrigger>
                            <div className="font-medium text-foreground">View Details</div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            {session.sessionType === SessionType.PHYSICAL && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Map */}
                                    {session.venueDetails.location && (
                                        <SessionMap location={session.venueDetails.location}/>
                                    )}

                                    {/* Seating Map */}
                                    {isMapLoading ? (
                                        <Skeleton className="h-80 w-full"/>
                                    ) : seatingMap ? (
                                        <SeatingLayout seatingMap={seatingMap}/>
                                    ) : (
                                        <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
                                            Expand to load seating map.
                                        </div>
                                    )}
                                </div>
                            )}

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
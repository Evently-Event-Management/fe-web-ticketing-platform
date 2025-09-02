'use client'

import {SessionStatus, SessionType} from "@/lib/validators/enums";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {CalendarIcon, Clock, MapPin, Video} from "lucide-react";
import {SessionInfoBasicDTO, SessionSeatingMapDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {SessionMap} from "@/app/(home-app)/events/[event_id]/_components/SessionMap";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {SeatingLayoutPreview} from "@/app/(home-app)/events/[event_id]/_components/SeatingLayoutPreview";
import {useState} from "react";
import {getSessionSeatingMap} from "@/lib/actions/public/SessionActions";
import {SeatStatusSummary} from "@/app/(home-app)/events/[event_id]/_components/SeatStatusSummery";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {useRouter} from "next/navigation";

export const SessionItem = ({session}: { session: SessionInfoBasicDTO }) => {
    const [seatingMap, setSeatingMap] = useState<SessionSeatingMapDTO | null>(null);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const router = useRouter();

    const onOpen = (isOpen: boolean) => {
        if (isOpen && !seatingMap && session.sessionType === SessionType.PHYSICAL) {
            setIsMapLoading(true);
            setTimeout(() => {
                getSessionSeatingMap(session.id)
                    .then(data => setSeatingMap(data))
                    .catch(err => console.error("Failed to fetch seating map", err))
                    .finally(() => setIsMapLoading(false));
            }, 500);
        }
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-LK", { // Using a specific locale for consistency
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-LK", { // Using a specific locale for consistency
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    // Function to format the sales start time
    const formatSalesStartTime = (iso: string) => {
        const salesStartDate = new Date(iso);
        const now = new Date();

        // If sales start is today, show only time
        if (salesStartDate.toDateString() === now.toDateString()) {
            return `Sales start today at ${formatTime(iso)}`;
        }
        // If sales start is tomorrow, show "Tomorrow at time"
        else if (salesStartDate.toDateString() === new Date(now.setDate(now.getDate() + 1)).toDateString()) {
            return `Sales start tomorrow at ${formatTime(iso)}`;
        }
        // Otherwise show full date and time
        else {
            return `Sales start on ${formatDate(iso)} at ${formatTime(iso)}`;
        }
    };

    const statusBadge: { [key in SessionStatus]: string } = {
        [SessionStatus.ON_SALE]: "border-green-500/50 bg-green-500/10 text-green-600",
        [SessionStatus.SOLD_OUT]: "border-red-500/50 bg-red-500/10 text-red-600",
        [SessionStatus.CANCELED]: "border-slate-500/50 bg-slate-500/10 text-slate-600",
        [SessionStatus.SCHEDULED]: "border-blue-500/50 bg-blue-500/10 text-blue-600",
        [SessionStatus.CLOSED]: "border-gray-500/50 bg-gray-500/10 text-gray-600",
        [SessionStatus.PENDING]: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600",
    };

    return (
        <Card className="mb-4 shadow-sm">
            <CardHeader>
                <div className="flex flex-wrap justify-between items-center w-full gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-semibold text-foreground">{formatDate(session.startTime)}</span>
                        <Badge variant="outline"
                               className={`ml-2 ${statusBadge[session.status]}`}>{session.status.replace('_', ' ')}</Badge>
                    </div>
                    <div>
                        {session.status === SessionStatus.ON_SALE &&
                            <Button
                                onClick={() => {
                                    // Navigate to a path with the session ID as a path parameter
                                    router.push(`${window.location.pathname}/${session.id}`);
                                }}
                            >
                                Buy Tickets
                            </Button>
                        }
                        {session.status === SessionStatus.SCHEDULED && session.salesStartTime && (
                            <span className="text-sm text-muted-foreground italic">
                                {formatSalesStartTime(session.salesStartTime)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4"/>
                    <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4"/>
                    <span>{session.venueDetails.name} - {session.sessionType === SessionType.PHYSICAL ? session.venueDetails.address :
                        <a href={session.venueDetails.onlineLink} target="_blank" rel="noreferrer"
                           className="text-primary underline hover:text-primary/80">Online Link</a>}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible onValueChange={(value) => onOpen(!!value)}>
                    <AccordionItem value={session.id} className="border-b-0">
                        <AccordionTrigger>
                            <div className="font-medium text-foreground">View Details</div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            {session.sessionType === SessionType.PHYSICAL ? (
                                // --- Resizable Layout for Physical Sessions ---
                                <ResizablePanelGroup
                                    direction="horizontal"
                                    className="min-h-[450px] w-full rounded-lg border"
                                >
                                    {/* --- LEFT PANEL --- */}
                                    <ResizablePanel defaultSize={33} minSize={25}>
                                        <div className="flex h-full flex-col gap-4 p-4">
                                            {isMapLoading ? (
                                                <>
                                                    <Skeleton className="h-48 w-full"/>
                                                    <Skeleton className="flex-grow w-full"/>
                                                </>
                                            ) : seatingMap ? (
                                                <>
                                                    <SeatStatusSummary seatingMap={seatingMap}/>
                                                    {session.venueDetails.location && (
                                                        <div className="flex-grow h-full">
                                                            <SessionMap location={session.venueDetails.location}/>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div
                                                    className="p-4 h-full border rounded-lg bg-muted/50 flex items-center justify-center text-center text-sm text-muted-foreground">
                                                    Expand to load session details.
                                                </div>
                                            )}
                                        </div>
                                    </ResizablePanel>

                                    <ResizableHandle withHandle/>

                                    {/* --- RIGHT PANEL --- */}
                                    <ResizablePanel defaultSize={67} minSize={40}>
                                        <div className="h-full p-4">
                                            {isMapLoading ? (
                                                <Skeleton className="h-full w-full"/>
                                            ) : seatingMap ? (
                                                <SeatingLayoutPreview seatingMap={seatingMap}/>
                                            ) : null}
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            ) : (
                                // Simple Summary for Online Sessions
                                <Card className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Video className="h-6 w-6 text-primary"/>
                                            <h3 className="text-lg font-semibold text-foreground">Online Session</h3>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">This is an online session. Access details
                                            will be provided after purchasing a ticket. Please use the link in the
                                            header to join.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
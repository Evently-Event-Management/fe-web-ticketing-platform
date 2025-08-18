import {SessionStatus, SessionType} from "@/lib/validators/salesStartRuleType";
import {AccordionContent, AccordionItem, AccordionTrigger, Accordion} from "@/components/ui/accordion";
import {CalendarIcon, Clock, MapPin} from "lucide-react";
import {SessionInfoBasicDTO} from "@/types/event";
import {Button} from "@/components/ui/button";
import {SessionMap} from "@/app/(home-app)/events/[event_id]/_components/SessionMap";

export const SessionItem = ({session}: { session: SessionInfoBasicDTO }) => {
    const onOpen = (isOpen: boolean) => {
        if (isOpen) {
            console.log(`Accordion for session ${session.id} expanded. Fetching seating map...`);
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
        <Accordion type="single" collapsible onValueChange={(value) => onOpen(!!value)}>
            <AccordionItem value={session.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                            <span className="font-semibold text-foreground">{formatDate(session.startTime)}</span>
                        </div>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge[session.status]}`}>{session.status.replace('_', ' ')}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4"/>
                                <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4"/>
                                <span>{session.venueDetails.name} - {session.sessionType === SessionType.PHYSICAL ? session.venueDetails.address :
                                    <a href={session.venueDetails.onlineLink} target="_blank" rel="noreferrer"
                                       className="text-primary underline">Online Link</a>}</span>
                            </div>
                        </div>
                        {session.status === SessionStatus.ON_SALE && <Button>Buy Tickets</Button>}
                    </div>
                    {session.sessionType === SessionType.PHYSICAL && session.venueDetails.location && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SessionMap location={session.venueDetails.location}/>
                            </div>
                            <div className="flex-1 p-4 bg-muted rounded-md text-center text-muted-foreground">
                                Seating Map Placeholder
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
import {SessionInfoBasicDTO} from '@/types/event';
import {Calendar, Clock, MapPin, ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export const SessionDetailsHeader = ({session, eventId}: { session: SessionInfoBasicDTO, eventId?: string }) => {

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    return (
        <div>
            {eventId &&
                <div className="flex items-center mb-2">
                    <Link href={`/events/${eventId}`} passHref>
                        <Button variant="ghost" size="sm" className="gap-1 px-2 h-8">
                            <ArrowLeft className="h-4 w-4"/>
                            <span>All Sessions</span>
                        </Button>
                    </Link>
                </div>
            }
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{'Session Details'}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar
                    className="h-4 w-4"/><span>{formatDate(session.startTime)}</span></div>
                <div className="flex items-center gap-2"><Clock
                    className="h-4 w-4"/><span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                </div>
                {session.sessionType === 'PHYSICAL' &&
                    <div className="flex items-center gap-2"><MapPin
                        className="h-4 w-4"/><span>{session.venueDetails.name}</span></div>
                }
            </div>
        </div>
    );
};
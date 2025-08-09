'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import {getEventById} from '@/lib/actions/eventActions';
import {EventDetailDTO} from '@/types/event'; // Assuming a detailed DTO exists
import {Skeleton} from '@/components/ui/skeleton';
import {EventStatusTracker} from '../_components/EventStatusTracker';
import {
    CoverPhotosCard,
    EventDetailsCard,
    TiersCard,
    SessionsCard
} from '../_components/EventReviewCards';

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (eventId) {
            setIsLoading(true);
            getEventById(eventId)
                .then(setEvent)
                .catch(() => toast.error("Failed to load event details."))
                .finally(() => setIsLoading(false));
        }
    }, [eventId]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-32 w-full"/>
            </div>
        );
    }

    if (!event) {
        return <div className="p-8 text-center">Event not found.</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>

            <EventStatusTracker status={event.status} rejectionReason={event.rejectionReason}/>

            {/* Reusing the modular card components */}
            <CoverPhotosCard items={event.coverPhotos}/>
            <EventDetailsCard details={event}/>
            <TiersCard tiers={event.tiers}/>
            <SessionsCard sessions={event.sessions}/>
        </div>
    );
}

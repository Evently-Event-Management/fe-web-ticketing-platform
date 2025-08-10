'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import {getEventById} from '@/lib/actions/eventActions';
import {EventDetailDTO} from '@/lib/validators/event';
import {Skeleton} from '@/components/ui/skeleton';
import {EventStatusTracker} from '../_components/EventStatusTracker';
import {useOrganization} from '@/providers/OrganizationProvider';

// Import review components to reuse them
import {ReviewEventHero} from '../_components/review/ReviewEventHero';
import {ReviewEventDetails} from '../_components/review/ReviewEventDetails';
import {ReviewTicketTiers} from '../_components/review/ReviewTicketTiers';
import {ReviewSessions} from '../_components/review/ReviewSessions';

// Import UI components
import {Card} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const {organization} = useOrganization();

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
        <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
            <EventStatusTracker status={event.status} rejectionReason={event.rejectionReason}/>
            <Separator className="my-6"/>

            {/* Hero Section with Cover Photos and Title */}
            <ReviewEventHero
                title={event.title}
                categoryName={event.categoryName}
                organization={organization}
                coverFiles={event.coverPhotos}
            />

            {/* Event Details Section with Description and Overview */}
            <ReviewEventDetails
                description={event.description}
                overview={event.overview}
            />

            {/* Ticket Tiers Section */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ticket Tiers</h2>
                <ReviewTicketTiers tiers={event.tiers}/>
            </Card>

            {/* Sales Summary Section */}
            {/*<Card className="p-6">*/}
            {/*    <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>*/}
            {/*    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
            {/*        <div className="bg-muted p-4 rounded-lg text-center">*/}
            {/*            <p className="text-muted-foreground text-sm">Total Sales</p>*/}
            {/*            <p className="text-2xl font-bold">$0</p>*/}
            {/*        </div>*/}
            {/*        <div className="bg-muted p-4 rounded-lg text-center">*/}
            {/*            <p className="text-muted-foreground text-sm">Tickets Sold</p>*/}
            {/*            <p className="text-2xl font-bold">0</p>*/}
            {/*        </div>*/}
            {/*        <div className="bg-muted p-4 rounded-lg text-center">*/}
            {/*            <p className="text-muted-foreground text-sm">Remaining</p>*/}
            {/*            <p className="text-2xl font-bold">0</p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</Card>*/}

            {/* Sessions Schedule Section */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sessions Schedule</h2>
                <ReviewSessions sessions={event.sessions} tiers={event.tiers}/>
            </Card>

            {/* Analytics Section */}
            {/*<Card className="p-6">*/}
            {/*    <h2 className="text-xl font-semibold mb-4">Event Performance</h2>*/}
            {/*    <div className="text-center p-12 bg-muted rounded-lg">*/}
            {/*        <p className="text-muted-foreground">Analytics features will be available once the event is*/}
            {/*            published.</p>*/}
            {/*    </div>*/}
            {/*</Card>*/}
        </div>
    );
}

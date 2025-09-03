// app/components/EventTracker.tsx (or similar location)

'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

// Define the shape of the event prop for TypeScript
interface EventData {
    id: string;
    title: string;
    organization_id: string;
}

export function EventTracker({ event }: { event: EventData }) {
    useEffect(() => {
        // Make sure we have event data before sending the event
        if (event && event.id) {
            sendGAEvent('event', 'view_event_details', {
                event_id: event.id,
                event_title: event.title,
                organization_id: event.organization_id,
                debug_mode: true,
            });
        }
    }, [event]); // This effect runs when the component mounts or the event prop changes

    // This component doesn't render anything to the page
    return null;
}
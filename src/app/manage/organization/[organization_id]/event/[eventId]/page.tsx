"use client";

import * as React from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {EventStatusTracker} from "../_components/EventStatusTracker";
import {EventPreview} from "@/app/manage/_components/review/EventPreview";
import {Separator} from "@/components/ui/separator";
import {useEventContext} from "@/providers/EventProvider";

export default function EventDetailsPage() {
    const {event, organization, isLoading, error} = useEventContext();

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 w-full space-y-8 max-w-5xl mx-auto">
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-64 w-full"/>
            </div>
        );
    }

    if (error || !organization || !event) {
        return (
            <div className="p-8 text-center w-full">
                {error || "Event Not Found"}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 w-full">
            {/* Main Content - The Event Preview */}
            <div className="max-w-5xl space-y-8 mx-auto">
                <EventStatusTracker status={event.status} rejectionReason={event.rejectionReason}/>
                <Separator className="my-6"/>
                <EventPreview
                    event={event}
                    organization={organization}
                />
            </div>
        </div>
    );
}

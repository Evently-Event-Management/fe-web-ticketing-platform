"use client";

import * as React from "react";
import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import {toast} from "sonner";
import {getMyEventById} from "@/lib/actions/eventActions";
import {EventDetailDTO} from "@/lib/validators/event";
import {Skeleton} from "@/components/ui/skeleton";
import {EventStatusTracker} from "../_components/EventStatusTracker";
import {EventPreview} from "@/app/manage/_components/review/EventPreview";
import {Separator} from "@/components/ui/separator";
import {getMyOrganizationById} from "@/lib/actions/organizationActions";
import {OrganizationResponse} from "@/types/oraganizations";
import {getEventViews} from "@/lib/actions/public/server/eventActions";

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);

    useEffect(() => {
        getEventViews(eventId).then((data) => {
            console.log("Event Analytics Data:", data);
        }).catch((error) => {
                console.error("Error fetching event analytics:", error);
            }
        );
    }, [eventId]);

    // Load event data
    useEffect(() => {
        console.log("Fetching event data for ID:", eventId);
        if (eventId) {
            setIsLoading(true);
            getMyEventById(eventId)
                .then((eventData) => {
                    setEvent(eventData);
                    // After we have event data, fetch organization details
                    if (eventData && eventData.organizationId) {
                        return getMyOrganizationById(eventData.organizationId);
                    }
                    return null;
                })
                .then((orgData) => {
                    if (orgData) {
                        setOrganization(orgData);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    toast.error(error.message || "Failed to load event details.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [eventId]); // Only depend on eventId, not the event state itself

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 w-full space-y-8 max-w-5xl mx-auto">
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-64 w-full"/>
            </div>
        );
    }

    if (!organization || !event) {
        return (
            <div className="p-8 text-center w-full">Event Not Found</div>
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

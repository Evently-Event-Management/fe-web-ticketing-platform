"use client";

import * as React from "react";
import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import {toast} from "sonner";
import {getEventById} from "@/lib/actions/eventActions";
import {EventDetailDTO} from "@/lib/validators/event";
import {Skeleton} from "@/components/ui/skeleton";
import {EventStatusTracker} from "../_components/EventStatusTracker";
import {EventPreview} from "@/app/manage/_components/review/EventPreview";
import {Separator} from "@/components/ui/separator";
import {getOrganizationById} from "@/lib/actions/organizationActions";
import {OrganizationResponse} from "@/types/oraganizations";

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);

    // Load event data
    useEffect(() => {
        console.log("Fetching event data for ID:", eventId);
        if (eventId) {
            setIsLoading(true);
            getEventById(eventId)
                .then((eventData) => {
                    setEvent(eventData);
                    // After we have event data, fetch organization details
                    if (eventData && eventData.organizationId) {
                        return getOrganizationById(eventData.organizationId);
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
            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-32 w-full"/>
            </div>
        );
    }

    if (!organization || !event) {
        return (
            <>
                <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-2xl font-semibold">Event Not Found</h1>
                </div>
            </>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
            <EventStatusTracker status={event.status} rejectionReason={event.rejectionReason}/>
            <Separator className="my-6"/>
            <EventPreview event={event} organization={organization}/>

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

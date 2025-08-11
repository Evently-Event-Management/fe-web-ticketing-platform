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
import {Card} from "@/components/ui/card";

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
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full"/>
                    <Skeleton className="h-48 w-full"/>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Skeleton className="h-48 w-full"/>
                    <Skeleton className="h-64 w-full"/>
                </div>
            </div>
        );
    }

    if (!organization || !event) {
        return (
            <div className="p-8 text-center w-full">Event Not Found</div>
        );
    }

    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
            {/* Main Content - The Event Preview */}
            <div className="lg:col-span-2">
                <EventStatusTracker status={event.status} rejectionReason={event.rejectionReason}/>
                <Separator className="my-6"/>
                <EventPreview
                    event={event}
                    organization={organization}
                />
            </div>

            {/* Sidebar - Fixed on scroll */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-120px)] overflow-y-auto">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-muted p-4 rounded-lg text-center">
                            <p className="text-muted-foreground text-sm">Total Sales</p>
                            <p className="text-2xl font-bold">$0</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                            <p className="text-muted-foreground text-sm">Tickets Sold</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                            <p className="text-muted-foreground text-sm">Remaining</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Event Performance</h2>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-muted-foreground">Analytics features will be available once the event is published.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

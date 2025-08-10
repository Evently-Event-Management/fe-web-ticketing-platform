'use client';

import * as React from 'react';
import {useState, useEffect, useCallback} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import {getEventById} from '@/lib/actions/eventActions';
import {EventDetailDTO} from '@/lib/validators/event';
import {Skeleton} from '@/components/ui/skeleton';
import {Separator} from '@/components/ui/separator';
import {getOrganizationById} from "@/lib/actions/organizationActions";
import {OrganizationResponse} from "@/types/oraganizations";
import EventPreview from "@/app/manage/_components/review/EventPreview";
import {AdminActionCard} from "@/app/manage/admin/events/_components/AdminActionCard";
import {OrganizationHistoryCard} from "@/app/manage/admin/events/_components/OrganizationHistoryCard";

export default function AdminEventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [organization, setOrganization] = useState<OrganizationResponse | null>(null);

    const fetchEventData = useCallback(() => {
        if (eventId) {
            setIsLoading(true);
            getEventById(eventId)
                .then(setEvent)
                .catch(() => toast.error("Failed to load event details."))
                .finally(() => setIsLoading(false));
        }
    }, [eventId]);

    const fetchOrganizationData = useCallback((orgId: string) => {
        if (orgId) {
            getOrganizationById(orgId)
                .then(setOrganization)
                .catch(() => toast.error("Failed to load organization details."));
        }
    }, []);

    useEffect(() => {
        if (eventId) {
            fetchEventData();
        }
    }, [eventId, fetchEventData]);

    useEffect(() => {
        if (event && event.organizationId) {
            fetchOrganizationData(event.organizationId);
        }
    }, [event, fetchOrganizationData]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        return <div className="p-8 text-center">Event not found.</div>;
    }

    // Note: You'll need a way to pass the File[] objects for the preview.
    // For a view-only page, you'd convert the event.coverPhotos (URLs) to a format the preview can use.
    // For simplicity, we'll pass the URLs directly and assume the preview component can handle them.

    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content - The Event Preview */}
            <div className="lg:col-span-2">
                <EventPreview
                    event={event}
                    organization={organization}
                />
            </div>

            {/* Admin Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <AdminActionCard eventId={event.id} onActionComplete={fetchEventData}/>
                <Separator/>
                <OrganizationHistoryCard organizationId={event.organizationId}/>
            </div>
        </div>
    );
}

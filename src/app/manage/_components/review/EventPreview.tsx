import React from 'react';
import {ReviewEventHero} from "@/app/manage/_components/review/ReviewEventHero";
import {EventDetailDTO} from "@/lib/validators/event";
import {OrganizationResponse} from "@/types/oraganizations";
import {ReviewEventDetails} from "@/app/manage/_components/review/ReviewEventDetails";
import {ReviewTicketTiers} from "@/app/manage/_components/review/ReviewTicketTiers";
import {Card} from "@/components/ui/card";
import {ReviewSessions} from "@/app/manage/_components/review/ReviewSessions";

export const EventPreview = ({event, organization}: { event: EventDetailDTO, organization: OrganizationResponse }) => {
    return (
        <>
            <ReviewEventHero
                title={event.title}
                categoryName={event.categoryName}
                organization={organization}
                coverFiles={event.coverPhotos}
            />
            <ReviewEventDetails
                description={event.description}
                overview={event.overview}
            />
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ticket Tiers</h2>
                <ReviewTicketTiers tiers={event.tiers}/>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sessions Schedule</h2>
                <ReviewSessions sessions={event.sessions} tiers={event.tiers}/>
            </Card>

        </>
    );
};

export default EventPreview;
import React from 'react';
import {ReviewEventHero} from "@/app/manage/_components/review/ReviewEventHero";
import {EventDetailDTO} from "@/lib/validators/event";
import {OrganizationResponse} from "@/types/oraganizations";
import {EventOverview} from "@/app/manage/_components/review/EventOverview";
import {ReviewTicketTiers} from "@/app/manage/_components/review/ReviewTicketTiers";
import {ReviewSessions} from "@/app/manage/_components/review/ReviewSessions";
import {Separator} from "@/components/ui/separator";

export const EventPreview = ({event, organization}: { event: EventDetailDTO, organization: OrganizationResponse }) => {
    return (
        <div className="space-y-8 w-full">

            <ReviewEventHero
                title={event.title}
                categoryName={event.categoryName}
                organization={organization}
                coverFiles={event.coverPhotos}
                description={event.description}
            />


            <Separator className={'border-3 my-2'}/>

            <EventOverview overview={event.overview}/>

            <Separator className={'border-3 my-2'}/>

            <ReviewTicketTiers tiers={event.tiers}/>

            <Separator className={'border-3 my-2'}/>

            <ReviewSessions sessions={event.sessions} tiers={event.tiers}/>
        </div>
    );
};

export default EventPreview;
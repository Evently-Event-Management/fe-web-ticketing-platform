import React from 'react';
import {ReviewEventHero} from "@/app/manage/_components/review/ReviewEventHero";
import {EventDetailDTO} from "@/lib/validators/event";
import {OrganizationResponse} from "@/types/oraganizations";
import {ReviewEventDetails} from "@/app/manage/_components/review/ReviewEventDetails";
import {ReviewTicketTiers} from "@/app/manage/_components/review/ReviewTicketTiers";
import {Card} from "@/components/ui/card";
import {ReviewSessions} from "@/app/manage/_components/review/ReviewSessions";
import {Separator} from "@/components/ui/separator";

export const EventPreview = ({event, organization}: { event: EventDetailDTO, organization: OrganizationResponse }) => {
    return (
        <div className="space-y-8 w-full">
            <section>
                <ReviewEventHero
                    title={event.title}
                    categoryName={event.categoryName}
                    organization={organization}
                    coverFiles={event.coverPhotos}
                    description={event.description}
                />
            </section>

            <Separator className={'border-3 my-2'}/>

            <section>
                <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                <ReviewEventDetails
                    overview={event.overview}
                />
            </section>

            <Separator className={'border-3 my-2'}/>

            <section>
                <Card className="p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Ticket Tiers</h2>
                    <ReviewTicketTiers tiers={event.tiers}/>
                </Card>
            </section>

            <Separator className={'border-3 my-2'}/>

            <section>
                <Card className="p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Sessions Schedule</h2>
                    <ReviewSessions sessions={event.sessions} tiers={event.tiers}/>
                </Card>
            </section>
        </div>
    );
};

export default EventPreview;
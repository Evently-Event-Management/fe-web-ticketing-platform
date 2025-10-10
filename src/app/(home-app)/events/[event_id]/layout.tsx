import React, { Suspense } from 'react';
import { EventHero, ReviewEventHeroSkeleton } from "@/app/(home-app)/events/[event_id]/_components/EventHero";
import { Separator } from "@/components/ui/separator";
import { getEventSummery, getEventTotalViews } from "@/lib/actions/public/server/eventActions";
import { EventOverview } from "@/app/manage/_components/review/EventOverview";
import { EventTracker } from './_components/EventTracker';


export default async function Layout({ params, children }: {
    params: Promise<{ event_id: string }>
    children: React.ReactNode;
}) {
    const { event_id } = await params;
    const eventSummery = await getEventSummery(event_id);
    const viewsData = await getEventTotalViews(event_id);

    return (
        <div>
            <div className="min-h-screen p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Suspense fallback={<ReviewEventHeroSkeleton />}>
                        <EventTracker event={{
                            title: eventSummery.title,
                            id: eventSummery.id,
                            organization_id: eventSummery.organization?.id || '',
                        }} />
                        <EventHero event={eventSummery}
                            viewCount={viewsData.success ? viewsData.viewCount : undefined} />
                        <Separator className={'border-3 my-2'} />
                        <EventOverview overview={eventSummery.overview} />
                    </Suspense>
                    <Separator className={'border-3 my-2'} />
                    {children}
                </div>
            </div>
        </div>
    );
}
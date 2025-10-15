import React, { Suspense } from 'react';
import { Separator } from "@/components/ui/separator";
import { getEventSummery, getEventTotalViews } from "@/lib/actions/public/server/eventActions";
import { EventOverview } from "@/app/manage/_components/review/EventOverview";
import { EventTracker } from './_components/EventTracker';
import { NetflixHero, NetflixHeroSkeleton } from './_components/NetflixHero';
import { Card, CardContent } from "@/components/ui/card";
import TiersSection from "./_components/TiersSection";
import { OffersCarousel } from "./_components/OffersCarousel";

export const dynamic = 'force-dynamic';


export default async function Layout({ params, children }: {
    params: { event_id: string }
    children: React.ReactNode;
}) {
    const { event_id } = params;
    const eventSummery = await getEventSummery(event_id);
    const viewsData = await getEventTotalViews(event_id);

    return (
        <div>
            <EventTracker event={{
                title: eventSummery.title,
                id: eventSummery.id,
                organization_id: eventSummery.organization?.id || '',
            }} />
            
            {/* Netflix-style Hero Section */}
            <Suspense fallback={<NetflixHeroSkeleton />}>
                <NetflixHero 
                    event={eventSummery}
                    viewCount={viewsData.success ? viewsData.viewCount : undefined} 
                />
            </Suspense>
            
            {/* Content Section */}
            <div className="py-8 px-4 sm:px-6 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Two column layout for description/overview and tickets */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Left Column: Event Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {eventSummery.description && (
                                <div className="prose dark:prose-invert max-w-none">
                                    <h2 className="text-xl font-bold mb-2">About this event</h2>
                                    <p>{eventSummery.description}</p>
                                </div>
                            )}
                            
                            <Separator className="my-6" />
                            
                            <EventOverview overview={eventSummery.overview} />
                            
                            <Separator className="my-6" />
                        </div>
                        
                        {/* Right Column: Ticket Panel - Using sticky positioning */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Tickets</h3>
                                        {eventSummery.tiers && eventSummery.tiers.length > 0 && (
                                            <TiersSection tiers={eventSummery.tiers} />
                                        )}
                                    </CardContent>
                                </Card>
                                
                                <OffersCarousel items={eventSummery.availableDiscounts} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Full-width content section */}
                    <div className="mt-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
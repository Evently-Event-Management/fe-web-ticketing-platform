import React, {Suspense} from 'react';
import {ReviewEventHero, ReviewEventHeroSkeleton} from "@/app/(home-app)/events/[event_id]/_components/ReviewEventHero";
import {eventServerActions} from "@/lib/actions/public/eventServerActions";
import {Separator} from "@/components/ui/separator";
import Sessions from "@/app/(home-app)/events/[event_id]/_components/Sessions";


const Page = async ({params}: { params: Promise<{ event_id: string }> }) => {
    const {event_id} = await params;
    const eventSummery = await eventServerActions(event_id);

    return (
        <div>
            <div className="min-h-screen p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Suspense fallback={<ReviewEventHeroSkeleton/>}>
                        <ReviewEventHero event={eventSummery}/>
                    </Suspense>
                    <Separator/>
                    <Sessions eventId={eventSummery.id}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
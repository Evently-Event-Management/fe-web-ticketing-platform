import React, {Suspense} from 'react';
import {ReviewEventHero, ReviewEventHeroSkeleton} from "@/app/(home-app)/events/[event_id]/_components/ReviewEventHero";
import {Separator} from "@/components/ui/separator";
import SessionsNoPagination from "@/app/(home-app)/events/[event_id]/_components/Sessions";
import {getEventSummery} from "@/lib/actions/public/server/eventActions";


const Page = async ({params}: { params: Promise<{ event_id: string }> }) => {
    const {event_id} = await params;
    const eventSummery = await getEventSummery(event_id);

    return (
        <div>
            <div className="min-h-screen p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Suspense fallback={<ReviewEventHeroSkeleton/>}>
                        <ReviewEventHero event={eventSummery}/>
                    </Suspense>
                    <Separator/>
                    <SessionsNoPagination eventId={eventSummery.id}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
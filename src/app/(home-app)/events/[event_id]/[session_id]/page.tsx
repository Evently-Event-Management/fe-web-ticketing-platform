import {getSessionSummery} from "@/lib/actions/public/server/eventActions";
import {notFound} from "next/navigation";
import SessionBooking from "@/app/(home-app)/events/[event_id]/[session_id]/_components/SessionBooking";
import {SessionDetailsHeader} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/SessionDetailsHeader";

const Page = async ({
                        params,
                        searchParams
                    }: {
    params: Promise<{ session_id: string, event_id: string }>,
    searchParams: Promise<{ discount?: string }>
}) => {
    const {session_id, event_id} = await params;
    const discountCode = (await searchParams).discount || null;

    // Fetch initial session summary on the server
    const sessionSummary = await getSessionSummery(session_id);

    // If session is not found, render a 404 page
    if (!sessionSummary) {
        notFound();
    }

    // Render the client component, passing the server-fetched data as a prop
    return (
        <>
            <SessionDetailsHeader session={sessionSummary} eventId={event_id}/>
            <SessionBooking
                session={sessionSummary}
                eventId={event_id}
                initialDiscountCode={discountCode}
            />
        </>
    );
}

export default Page;
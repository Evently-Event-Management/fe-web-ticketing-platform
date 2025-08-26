import React from 'react';
import SessionsNoPagination from "@/app/(home-app)/events/[event_id]/_components/Sessions";


const Page = async ({params}: {
    params: Promise<{ event_id: string }>
    children: React.ReactNode;
}) => {
    const {event_id} = await params;

    return <SessionsNoPagination eventId={event_id}/>
}

export default Page;
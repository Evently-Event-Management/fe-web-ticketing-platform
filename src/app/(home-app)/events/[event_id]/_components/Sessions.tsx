'use client';

import {PaginatedResponse} from '@/types/paginatedResponse';
import React, {useEffect, useState} from 'react';
import {SessionInfoBasicDTO} from "@/types/event";
import {getEventSessions} from '@/lib/actions/public/eventActions';
import {CalendarIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {SessionItem} from "@/app/(home-app)/events/[event_id]/_components/SessionItem";

const Sessions = ({eventId}: { eventId: string }) => {
    const [page, setPage] = useState(0);
    const [sessionsData, setSessionsData] = useState<PaginatedResponse<SessionInfoBasicDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            const data = await getEventSessions({eventId, page});
            setSessionsData(data);
            setIsLoading(false);
        };
        fetchSessions();
    }, [eventId, page]);

    if (isLoading) return <div>Loading sessions...</div>;
    if (!sessionsData || sessionsData.empty) return <div>No sessions found.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-6 h-6"/> Sessions
            </h2>
            <div className="space-y-2">
                {sessionsData.content.map(session => <SessionItem key={session.id} session={session}/>)}
            </div>
            <div className="flex justify-between items-center">
                <Button onClick={() => setPage(p => p - 1)} disabled={sessionsData.first}>Previous</Button>
                <span>Page {sessionsData.number + 1} of {sessionsData.totalPages}</span>
                <Button onClick={() => setPage(p => p + 1)} disabled={sessionsData.last}>Next</Button>
            </div>
        </div>
    );
};

export default Sessions;
'use client';

import React, {useEffect, useState} from 'react';
import {SessionInfoBasicDTO} from "@/types/event";
import {getEventSessionsInRange} from '@/lib/actions/public/eventActions';
import {CalendarIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {SessionItem} from "@/app/(home-app)/events/[event_id]/_components/SessionItem";
import {DatePicker} from "@/components/ui/datepicker";

const SessionsNoPagination = ({eventId}: { eventId: string }) => {
    // Default dates: one week ago to three months ahead
    const now = new Date();
    const defaultFromDate = new Date(now);
    defaultFromDate.setDate(now.getDate() - 7);
    const defaultToDate = new Date(now);
    defaultToDate.setMonth(now.getMonth() + 3);

    const [fromDate, setFromDate] = useState<string | null>(defaultFromDate.toISOString());
    const [toDate, setToDate] = useState<string | null>(defaultToDate.toISOString());
    const [sessions, setSessions] = useState<SessionInfoBasicDTO[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSessions = async () => {
        if (!fromDate || !toDate) return;
        setIsLoading(true);
        try {
            const data = await getEventSessionsInRange({eventId, fromDate, toDate});
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch sessions on component mount and when eventId changes
    useEffect(() => {
        fetchSessions().then();
    }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div id="sessions-section" className="max-w-7xl mx-auto space-y-4 scroll-mt-16">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-6 h-6"/> Sessions
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">From Date</span>
                    <DatePicker
                        onChange={setFromDate}
                        placeholder="Select start date"
                        defaultDate={defaultFromDate}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">To Date</span>
                    <DatePicker
                        onChange={setToDate}
                        placeholder="Select end date"
                        defaultDate={defaultToDate}
                    />
                </div>
                <Button
                    onClick={fetchSessions}
                    disabled={!fromDate || !toDate || isLoading}
                    className="mt-7"
                >
                    {isLoading ? "Loading..." : "Update Sessions"}
                </Button>
            </div>
            <div className="space-y-2">
                {isLoading ? (
                    <div>Loading sessions...</div>
                ) : sessions && sessions.length > 0 ? (
                    sessions.map(session => <SessionItem key={session.id} session={session}/>)
                ) : (
                    <div>No sessions found for the selected date range.</div>
                )}
            </div>
        </div>
    );
};

export default SessionsNoPagination;
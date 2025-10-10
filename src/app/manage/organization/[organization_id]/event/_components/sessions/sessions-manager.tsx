"use client"

import * as React from 'react';
import Link from 'next/link';
import {AlertTriangle, Plus, RefreshCcw} from 'lucide-react';
import {useEventContext} from '@/providers/EventProvider';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {SessionCard} from "@/app/manage/organization/[organization_id]/event/_components/sessions/session-card";

export const SessionsManager: React.FC = () => {
    const {event, isLoading, error, refetchSessions} = useEventContext();

    const handleRefresh = () => {
        // Use the new refetchSessions function from the context
        refetchSessions().then();
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto">
                <Skeleton className="h-10 w-64 mb-4"/>
                <Skeleton className="h-6 w-96 mb-8"/>
                <Skeleton className="h-64 w-full"/>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive"/>
                </div>
                <h2 className="text-xl font-semibold text-destructive">
                    Event not found
                </h2>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Session Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage sessions for {event.title}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
                        <span>Refresh {isLoading ? 'ing...' : ''}</span>
                    </Button>
                    <Link
                        href={`/manage/organization/${event.organizationId}/event/${event.id}/sessions/create`}
                    >
                        <Button>
                            <Plus className="h-4 w-4 mr-2"/>
                            New Session
                        </Button>
                    </Link>
                </div>
            </div>

            {error ? (
                <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
                    {error}
                </div>
            ) : isLoading ? (
                <Skeleton className="h-64 w-full"/>
            ) : event && (!event.sessions || event.sessions.length === 0) ? (
                <div className="text-center p-8 border rounded-md">
                    <p className="mb-4">No sessions found</p>
                    <Link href={`/manage/organization/${event.organizationId}/event/${event.id}/sessions/create`}>
                        <Button variant="outline">
                            Create your first session
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {event.sessions.map((session) => (
                        <SessionCard key={session.id} session={session}/>
                    ))}
                </div>
            )}
        </div>
    );
};
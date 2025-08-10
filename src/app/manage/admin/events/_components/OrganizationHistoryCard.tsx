'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { getOrganizationEvents } from '@/lib/actions/eventActions';
import { EventSummaryDTO } from '@/lib/validators/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationHistoryCardProps {
    organizationId: string;
}

export function OrganizationHistoryCard({ organizationId }: OrganizationHistoryCardProps) {
    const [history, setHistory] = useState<EventSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (organizationId) {
            // Fetch the last 5 events for this organization
            getOrganizationEvents(organizationId, undefined, undefined, 0, 5)
                .then(data => setHistory(data.content))
                .catch(err => console.error("Failed to fetch org history:", err))
                .finally(() => setIsLoading(false));
        }
    }, [organizationId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization History</CardTitle>
                <CardDescription>A brief look at their recent activity.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map(event => (
                            <li key={event.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium">{event.title}</p>
                                    <p className="text-muted-foreground">
                                        Created on {format(parseISO(event.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <Badge variant={event.status === 'APPROVED' ? 'default' : 'secondary'}>
                                    {event.status}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

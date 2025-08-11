'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {getAnyOrganizationEvents_Admin} from '@/lib/actions/eventActions';
import {EventSummaryDTO} from '@/lib/validators/event';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {format, parseISO} from 'date-fns';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {OrganizationResponse} from "@/types/oraganizations";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";

interface OrganizationHistoryCardProps {
    organization: OrganizationResponse;
    currentEventId?: string;
}

export function OrganizationHistoryCard({organization, currentEventId}: OrganizationHistoryCardProps) {
    const [history, setHistory] = useState<EventSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (organization.id) {
            // Fetch the last 5 events for this organization
            getAnyOrganizationEvents_Admin(organization.id, undefined, undefined, 0, 5)
                .then(data => setHistory(data.content))
                .catch(err => console.error("Failed to fetch org history:", err))
                .finally(() => setIsLoading(false));
        }
    }, [organization.id]);

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Card>
            <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={organization.logoUrl || ''} alt={organization.name}/>
                        <AvatarFallback>
                            {getInitials(organization.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{organization.name}</CardTitle>
                        <CardDescription>A brief look at their recent activity.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map(event => (
                            <Link href={`/manage/admin/events/${event.id}`} key={event.id} className="block">
                                <li key={event.id}
                                    className={`flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted transition-colors ${currentEventId === event.id ? 'bg-muted' : ''}`}>
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
                            </Link>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

import Link from 'next/link';
import Image from 'next/image';
import {EventThumbnailDTO} from '@/types/event';
import {CalendarDays, MapPin} from 'lucide-react';
import * as React from 'react';

interface TopbarEventCardProps {
    event: EventThumbnailDTO;
    onNavigate?: () => void;
}

function formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function TopbarEventCard({event, onNavigate}: TopbarEventCardProps) {
    const earliestSession = event.earliestSession;
    const formattedDate = earliestSession?.startTime ? formatEventDate(earliestSession.startTime) : '';
    const locationParts = earliestSession
        ? [earliestSession.venueName, earliestSession.city]
            .filter(Boolean)
            .join(' · ')
        : '';
    const startingPriceLabel = typeof event.startingPrice === 'number'
        ? `From LKR ${event.startingPrice.toLocaleString('en-LK')}`
        : 'Pricing TBD';

    return (
        <Link
            href={`/events/${event.id}`}
            onClick={onNavigate}
            className="flex gap-3 rounded-lg border bg-card p-3 transition hover:bg-accent/50"
        >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                <Image
                    src={event.coverPhotoUrl || '/images/logo-high.png'}
                    alt={event.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                {formattedDate && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5"/>
                        <span className="truncate">{formattedDate}</span>
                    </p>
                )}
                {locationParts && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5"/>
                        <span className="truncate">{locationParts}</span>
                    </p>
                )}
                <p className="text-xs font-medium text-primary">{startingPriceLabel}</p>
            </div>
        </Link>
    );
}

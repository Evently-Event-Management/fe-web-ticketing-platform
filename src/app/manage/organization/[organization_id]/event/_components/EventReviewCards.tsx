'use client';

import * as React from 'react';
import {CreateEventFormData} from '@/lib/validators/event';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Image from 'next/image';
import {Label} from '@/components/ui/label';
import {
    SessionListItemReview
} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItemReview";
import {Images} from "lucide-react";
import Autoplay from 'embla-carousel-autoplay';

// --- Cover Photos Card ---
export function CoverPhotosCard({items}: { items: (File | string)[] }) {
    if (items.length === 0) return null;

    const getImageUrl = (item: File | string) => {
        if (typeof item === 'string') {
            return item; // It's already a URL
        }
        return URL.createObjectURL(item); // It's a File object, create a temporary URL
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-muted-foreground"/>
                    Cover Photos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Carousel plugins={[Autoplay({delay: 4000, stopOnInteraction: false})]}>
                    <CarouselContent>
                        {items.map((item, index) => (
                            <CarouselItem key={index}>
                                <div className="aspect-[21/9] w-full relative">
                                    <Image
                                        src={getImageUrl(item)}
                                        alt={`Cover photo ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4"/><CarouselNext className="absolute right-4"/>
                </Carousel>
            </CardContent>
        </Card>
    );
}


// --- Event Details Card ---
export function EventDetailsCard({details}: { details: Partial<CreateEventFormData> }) {
    return (
        <Card>
            <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div><Label>Title</Label><p>{details.title}</p></div>
                <div><Label>Description</Label><p className="text-muted-foreground">{details.description}</p></div>
                <div><Label>Overview</Label><p
                    className="text-muted-foreground whitespace-pre-wrap">{details.overview}</p></div>
                <div><Label>Category</Label><p>{details.categoryName}</p></div>
            </CardContent>
        </Card>
    );
}

// --- Tiers Card ---
export function TiersCard({tiers}: { tiers: CreateEventFormData['tiers'] }) {
    return (
        <Card>
            <CardHeader><CardTitle>Tiers & Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                {tiers.map(tier => (
                    <div key={tier.id} className="flex justify-between items-center p-2 border-b">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full" style={{backgroundColor: tier.color}}/>
                            <span>{tier.name}</span>
                        </div>
                        <span>${tier.price.toFixed(2)}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function SessionsCard({sessions}: { sessions: CreateEventFormData['sessions'] }) {
    return (
        <Card>
            <CardHeader><CardTitle>Scheduled Sessions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {sessions.map((session, index) => (
                    <SessionListItemReview key={index} session={session} index={index}/>
                ))}
            </CardContent>
        </Card>
    );
}

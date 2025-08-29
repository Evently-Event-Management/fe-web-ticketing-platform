'use client';

import React from 'react';
import {Card, CardContent, CardFooter, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Building, Calendar, MapPin, Heart, Share2, Tag} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

// --- Mocking types for demonstration ---
interface EventThumbnailDTO {
    id: string;
    title: string;
    coverPhotoUrl: string;
    organizationName: string;
    categoryName: string;
    earliestSession: {
        startTime: string;
        venueName: string;
        city: string;
    };
    startingPrice: number | null;
}


// --- Helper Functions ---
/**
 * Formats an ISO 8601 date string into a more readable format.
 * @param {string} isoString - The date string to format.
 * @returns {{day: string, month: string, fullDate: string}}
 */
const formatDate = (isoString: string) => {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        const day = date.toLocaleDateString('en-US', {day: '2-digit'});
        const month = date.toLocaleDateString('en-US', {month: 'short'}).toUpperCase();
        const fullDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).replace(' at', ' -');
        return {day, month, fullDate};
    } catch (error) {
        console.error("Error formatting date:", error);
        return {day: '??', month: '???', fullDate: 'Date not available'};
    }
};


export function EventCard({event}: { event: EventThumbnailDTO }) {
    const {
        title,
        coverPhotoUrl,
        organizationName,
        categoryName,
        earliestSession,
        startingPrice,
    } = event;

    const {day, month, fullDate} = formatDate(earliestSession?.startTime);

    return (
        <Card
            className="py-0 w-full max-w-sm rounded-xl overflow-hidden transform hover:scale-101 transition-transform duration-300 ease-in-out font-sans shadow-lg gap-3">
            <CardHeader className="p-0 relative">
                <AspectRatio ratio={16 / 9}>
                    <Image
                        fill
                        src={coverPhotoUrl}
                        alt={title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/6366f1/ffffff?text=Event+Image';
                        }}
                    />
                </AspectRatio>

                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-card rounded-lg p-2 text-center shadow-md">
                    <p className="text-xl font-bold text-primary">{day}</p>
                    <p className="text-xs font-semibold">{month}</p>
                </div>

                {/* Action Icons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                    <Button variant="ghost" size="icon"
                            className="bg-card/80 backdrop-blur-sm rounded-full h-10 w-10 hover:bg-white">
                        <Heart className="h-5 w-5 text-red-500"/>
                    </Button>
                    <Button variant="ghost" size="icon"
                            className="bg-card/80 backdrop-blur-sm rounded-full h-10 w-10 hover:bg-white">
                        <Share2 className="h-5 w-5 text-blue-700 dark:text-blue-300"/>
                    </Button>
                </div>

                {/* Starting Price Badge */}
                <div className="absolute bottom-4 right-4 bg-card rounded-lg p-2 text-center shadow-md">
                    <span className="text-sm font-bold">
                        {startingPrice ? `LKR ${startingPrice.toFixed(2)}` : 'Free'}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-4 py-0">
                <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">{title}</h3>
                <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 flex-shrink-0"/>
                        <span>{categoryName}</span>
                    </div>
                    <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"/>
                        <span>{earliestSession?.venueName}, {earliestSession?.city}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0"/>
                        <span>{fullDate}</span>
                    </div>
                    <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 flex-shrink-0"/>
                        <span>By {organizationName}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 gap-3 flex">
                <Link href={`/events/${event.id}`} className="w-full">
                    <Button className={'w-full'}>Buy Tickets</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

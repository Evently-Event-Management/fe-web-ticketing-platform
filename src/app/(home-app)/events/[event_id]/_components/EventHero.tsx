import * as React from 'react';
import {Eye, Tag} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {EventBasicInfoDTO} from "@/types/event";
import {Skeleton} from "@/components/ui/skeleton";
import EventCarousel from "@/components/EventCarousel";
import TiersSection from "@/app/(home-app)/events/[event_id]/_components/TiersSection";
import {Separator} from "@/components/ui/separator";
import {Card, CardContent} from "@/components/ui/card";
import {OffersCarousel} from "@/app/(home-app)/events/[event_id]/_components/OffersCarousel";

// A new component for the sticky right-side panel
const TicketActionPanel: React.FC<{ tiers: EventBasicInfoDTO['tiers'] }> = ({tiers}) => {
    return (
        <div className="">
            <Card>
                <CardContent>
                    {tiers && tiers.length > 0 && <TiersSection tiers={tiers}/>}
                </CardContent>
            </Card>
        </div>
    );
};


export const EventHero: React.FC<{ event: EventBasicInfoDTO, viewCount?: number }> = ({event, viewCount}) => {
    const {title, description, coverPhotos, organization, category, tiers} = event;

    return (
        // Changed from a single column to a responsive grid layout
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Left Column: Event Details */}
            <div className="lg:col-span-2 space-y-6">
                {coverPhotos && coverPhotos.length > 0 && (
                    <EventCarousel coverPhotos={coverPhotos}/>
                )}

                <div className="flex items-center gap-4">
                    {organization && (
                        <Avatar className="h-14 w-14 border flex-shrink-0">
                            <AvatarImage src={organization.logoUrl || ''} alt={organization.name}/>
                            <AvatarFallback>{organization.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            {organization && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <span>by</span>
                                    <span className="font-medium text-foreground">{organization.name}</span>
                                </div>
                            )}
                            {category && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Tag className="w-4 h-4"/>
                                    <span>{category.name}</span>
                                    {category.parentName &&
                                        <span className="ml-1 text-xs">({category.parentName})</span>}
                                </div>
                            )}
                            {viewCount !== undefined && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Eye className="w-4 h-4"/>
                                    <span>{viewCount.toLocaleString()} views</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    {description && (
                        <div>
                            <h2 className="text-xl font-bold mb-2">About this event</h2>
                            <p>{description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Ticket Panel */}
            <div className="lg:col-span-1 space-y-6">
                <TicketActionPanel tiers={tiers}/>
                <OffersCarousel items={event.availableDiscounts} />
            </div>
        </div>
    );
};

export const ReviewEventHeroSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 px-4 animate-pulse">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-video w-full rounded-2xl"/>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full"/>
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 w-3/4"/>
                        <Skeleton className="h-4 w-1/4"/>
                    </div>
                </div>
                <Separator/>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-2"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-5/6"/>
                </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-1">
                <Skeleton className="w-full h-96 rounded-2xl"/>
            </div>
        </div>
    );
};
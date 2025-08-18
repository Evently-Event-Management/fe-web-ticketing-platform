import * as React from 'react';
import {Tag} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {EventBasicInfoDTO} from "@/types/event";
import {Skeleton} from "@/components/ui/skeleton";
import EventCarousel from "@/app/(home-app)/events/[event_id]/_components/EventCarousel";
import TiersSection from "@/app/(home-app)/events/[event_id]/_components/TiersSection";
import {Separator} from "@/components/ui/separator";

export const ReviewEventHero: React.FC<{ event: EventBasicInfoDTO }> = ({event}) => {
    const {title, description, overview, coverPhotos, organization, category, tiers} = event;

    return (
        <div className="space-y-6">
            {coverPhotos && coverPhotos.length > 0 && (
                <EventCarousel coverPhotos={coverPhotos}/>
            )}
            <div className="flex items-center gap-4 max-w-7xl mx-auto">
                {organization && (
                    <Avatar className="h-12 w-12 border flex-shrink-0">
                        <AvatarImage src={organization.logoUrl || ''} alt={organization.name}/>
                        <AvatarFallback>{organization.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                )}
                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold truncate text-gray-900 dark:text-white">{title}</h1>
                    {category && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Tag className="w-4 h-4"/>
                            <span>{category.name}</span>
                            {category.parentName && <span className="ml-2 text-xs">({category.parentName})</span>}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-start gap-6 max-w-7xl w-full justify-start">
                {description && (
                    <div className="prose dark:prose-invert max-w-3xl text-left text-gray-600 dark:text-gray-300">
                        <p>{description}</p>
                    </div>
                )}
                <Separator/>
                {tiers && tiers.length > 0 && (
                    <TiersSection tiers={tiers}/>
                )}
                <Separator/>
                {overview && (
                    <div className="prose dark:prose-invert max-w-3xl text-left text-gray-600 dark:text-gray-300">
                        <p>{overview}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export const ReviewEventHeroSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Carousel Skeleton */}
            <div className="w-full max-w-7xl mx-auto">
                <Skeleton className="aspect-[21/9] w-full rounded-2xl"/>
            </div>

            {/* Title, Avatar, Category Skeleton */}
            <div className="flex items-center gap-4 max-w-7xl mx-auto">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0"/>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <Skeleton className="h-8 w-2/3"/>
                    <Skeleton className="h-4 w-1/3"/>
                </div>
            </div>

            {/* Overview Skeleton */}
            <div className="space-y-2 max-w-3xl mx-auto">
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-5/6"/>
                <Skeleton className="h-4 w-2/3"/>
            </div>
        </div>
    );
};

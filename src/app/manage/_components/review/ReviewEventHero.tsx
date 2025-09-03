'use client';

import * as React from 'react';
import {Tag} from 'lucide-react';
import {OrganizationResponse} from "@/types/oraganizations";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import EventCarousel from "@/components/EventCarousel";


interface ReviewEventHeroProps {
    title: string;
    categoryName?: string | null;
    organization?: OrganizationResponse | null;
    coverFiles: File[] | string[];
}

export const ReviewEventHero: React.FC<ReviewEventHeroProps> = ({
                                                                    title,
                                                                    categoryName,
                                                                    organization,
                                                                    coverFiles
                                                                }) => {

    // Helper function to get image URL
    const getImageUrl = (file: File | string): string => {
        if (typeof file === 'string') {
            return file; // Assuming it's already a URL
        }
        return URL.createObjectURL(file);
    };

    return (
        <div className="space-y-6">
            <EventCarousel coverPhotos={coverFiles.map(getImageUrl)}/>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm">

                    {organization?.name && (
                        <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={organization.logoUrl} alt={organization.name}/>
                                <AvatarFallback> {organization.name.charAt(0).toUpperCase()} </AvatarFallback>
                            </Avatar>
                            <span>By {organization.name}</span>
                        </div>
                    )}

                    {categoryName && (
                        <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-muted-foreground"/>
                            <span>{categoryName}</span>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

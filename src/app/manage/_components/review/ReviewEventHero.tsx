'use client';

import * as React from 'react';
import Image from 'next/image';
import {Tag} from 'lucide-react';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';
import {OrganizationResponse} from "@/types/oraganizations";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";


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
        return URL.createObjectURL(file); // Create a local URL for the file
    };

    return (
        <div className="space-y-6">
            {coverFiles.length > 0 && (
                <div className="w-full rounded-xl overflow-hidden">
                    <Carousel plugins={[Autoplay({delay: 4000, stopOnInteraction: false})]}>
                        <CarouselContent>
                            {coverFiles.map((file, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[21/9] w-full relative">
                                        <Image
                                            src={getImageUrl(file)}
                                            alt={`Cover photo ${index + 1}`}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4"/>
                        <CarouselNext className="absolute right-4"/>
                    </Carousel>
                </div>
            )}

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

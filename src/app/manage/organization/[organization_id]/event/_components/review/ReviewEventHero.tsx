'use client';

import * as React from 'react';
import Image from 'next/image';
import { Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';
import {OrganizationResponse} from "@/types/oraganizations";


interface ReviewEventHeroProps {
    title: string;
    categoryName?: string | null;
    organization?: OrganizationResponse | null;
    coverFiles: File[];
}

export const ReviewEventHero: React.FC<ReviewEventHeroProps> = ({
    title,
    categoryName,
    organization,
    coverFiles
}) => {
    const getImageUrl = (file: File): string => {
        return URL.createObjectURL(file);
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
                    {categoryName && (
                        <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span>{categoryName}</span>
                        </div>
                    )}

                    {organization?.name && (
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>By {organization.name}</span>
                        </div>
                    )}

                    <div className="ml-auto">
                        <Button variant="outline" disabled>
                            Buy Tickets
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

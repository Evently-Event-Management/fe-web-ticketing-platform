'use client'

import React from 'react';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';
import Image from "next/image";

const EventCarousel = ({coverPhotos}: { coverPhotos: string[] }) => {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <Carousel
                plugins={[Autoplay({delay: 4000, stopOnInteraction: true})]}
                className="rounded-2xl overflow-hidden shadow-2xl"
                opts={{loop: true}}
            >
                <CarouselContent>
                    {coverPhotos.map((url, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-[21/9] w-full relative bg-gray-200 dark:bg-gray-800">
                                <Image
                                    src={url}
                                    alt={`Cover photo ${index + 1}`}
                                    className="object-cover w-full h-full"
                                    fill
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/1280x720/31343C/FFFFFF?text=Image+Not+Found';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10"/>
                <CarouselNext
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10"/>
            </Carousel>
        </div>
    );
};

export default EventCarousel;
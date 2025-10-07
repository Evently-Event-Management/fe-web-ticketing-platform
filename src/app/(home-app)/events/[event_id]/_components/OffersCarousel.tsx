// app/(home-app)/events/[event_id]/_components/OffersCarousel.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { type CarouselApi } from "@/components/ui/carousel"
import { DiscountThumbnailDTO } from "@/types/event"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { OfferCard } from "@/app/(home-app)/events/[event_id]/_components/OfferCard" // Adjust import path
import Autoplay from "embla-carousel-autoplay"

interface OffersCarouselProps {
    items: DiscountThumbnailDTO[]
    isLoading?: boolean
    className?: string
}

export function OffersCarousel({
                                   items,
                                   isLoading = false,
                                   className = "",
                               }: OffersCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    // Use a ref for the Autoplay plugin
    const plugin = useRef(
        Autoplay({ delay: 10000, stopOnInteraction: false, stopOnMouseEnter: true })
    )

    useEffect(() => {
        if (!api) {
            return
        }

        setCurrent(api.selectedScrollSnap())

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        api.on("select", onSelect)

        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    if (isLoading) {
        return <LoadingSkeleton className={className} />
    }

    if (items.length === 0) {
        return (
            <div className={`text-center py-4 text-sm text-muted-foreground ${className}`}>
                No special offers available at the moment.
            </div>
        )
    }

    return (
        <div className={`w-full max-w-md mx-auto ${className}`}>
            <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                opts={{
                    align: "start",
                    loop: items.length > 1,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {items.map((item, index) => (
                        <CarouselItem key={index} className="pl-4 basis-full">
                            <div className="p-1">
                                <OfferCard item={item} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* ✅ ADDED: Dot navigation */}
            {items.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
                            }`}
                            aria-label={`Go to offer ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}


const LoadingSkeleton = ({ className }: { className?: string }) => (
    <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </CardContent>
        </Card>
    </div>
)
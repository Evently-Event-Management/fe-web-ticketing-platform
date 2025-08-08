'use client';

import * as React from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Image from 'next/image';
import {Label} from '@/components/ui/label';
import {
    SessionListItemReview
} from "@/app/manage/organization/[organization_id]/event/_components/SessionListItemReview";

// --- Main Review Step Component ---
export function ReviewStep({coverFiles}: { coverFiles: File[] }) {
    const {watch} = useFormContext<CreateEventFormData>();
    const formData = watch(); // Get all form data

    return (
        <div className="space-y-8">
            {/* Cover Photos */}
            {coverFiles.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Cover Photos</CardTitle></CardHeader>
                    <CardContent>
                        <Carousel>
                            <CarouselContent>
                                {coverFiles.map((file, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-[21/9] w-full relative">
                                            <Image src={URL.createObjectURL(file)} alt={`Cover photo ${index + 1}`} fill
                                                   className="object-cover rounded-lg"/>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-4"/><CarouselNext className="absolute right-4"/>
                        </Carousel>
                    </CardContent>
                </Card>
            )}

            {/* Core Details */}
            <Card>
                <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div><Label>Title</Label><p>{formData.title}</p></div>
                    <div><Label>Description</Label><p className="text-muted-foreground">{formData.description}</p></div>
                    <div><Label>Overview</Label><p
                        className="text-muted-foreground whitespace-pre-wrap">{formData.overview}</p></div>
                    {/* You would fetch and display the category name here */}
                    <div><Label>Category</Label><p>{formData.categoryId}</p></div>
                </CardContent>
            </Card>

            {/* Tiers */}
            <Card>
                <CardHeader><CardTitle>Tiers & Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {formData.tiers.map(tier => (
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

            {/* Sessions */}
            <Card>
                <CardHeader><CardTitle>Scheduled Sessions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {formData.sessions.map((session, index) => (
                        <SessionListItemReview key={index} session={session} index={index}/>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

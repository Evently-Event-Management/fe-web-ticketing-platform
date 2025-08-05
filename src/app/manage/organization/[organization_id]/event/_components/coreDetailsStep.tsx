'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useOrganization} from '@/providers/OrganizationProvider';
import {useLimits} from '@/providers/LimitProvider';
import {VenueResponse} from '@/types/venue';
import {CategoryResponse} from '@/types/category';
import {getVenuesByOrganization} from '@/lib/actions/venueActions';
import {getAllCategories} from '@/lib/actions/categoryActions';
import {coreDetailsSchema, CoreDetailsData} from '@/lib/validators/event';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Switch} from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from '@/components/ui/select';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Image from 'next/image';
import {ImageIcon, X, PlusCircle, Upload} from 'lucide-react';
import {toast} from 'sonner';
import Autoplay from 'embla-carousel-autoplay';

// --- Step 1: Core Details Component ---
export function CoreDetailsStep({onNextAction}: { onNextAction: () => void }) {
    const {organization} = useOrganization();
    const {myLimits} = useLimits();
    const [venues, setVenues] = useState<VenueResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [coverFiles, setCoverFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxPhotos = myLimits?.eventLimits.maxCoverPhotos || 1;

    const form = useForm<CoreDetailsData>({
        resolver: zodResolver(coreDetailsSchema),
        defaultValues: {
            title: '',
            description: '',
            overview: '',
            categoryId: '', // Ensure categoryId is present
            isOnline: false,
        },
    });

    useEffect(() => {
        if (organization) {
            getVenuesByOrganization(organization.id).then(setVenues);
        }
        getAllCategories().then(setCategories);
    }, [organization]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if ((coverFiles.length + files.length) > maxPhotos) {
                toast.error(`You can only upload a maximum of ${maxPhotos} photos.`);
                return;
            }
            setCoverFiles(prev => [...prev, ...files]);
        }
    };

    const removeImage = (index: number) => {
        setCoverFiles(prev => prev.filter((_, i) => i !== index));
    };

    function onSubmit(data: CoreDetailsData) {
        console.log("Step 1 Data:", data);
        console.log("Cover Files:", coverFiles);
        onNextAction();
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Hero Cover Photos Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cover Photos</CardTitle>
                        <CardDescription>This is the first thing people will see. Upload up
                            to {maxPhotos} images.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {coverFiles.length > 0 ? (
                            <Carousel plugins={[Autoplay({delay: 4000, stopOnInteraction: false})]}>
                                <CarouselContent>
                                    {coverFiles.map((file, index) => (
                                        <CarouselItem key={index} className="relative">
                                            <div className="aspect-[21/9] w-full relative">
                                                <Image src={URL.createObjectURL(file)} alt={`Cover photo ${index + 1}`}
                                                       fill className="object-cover rounded-lg"/>
                                                <Button type="button" variant="destructive" size="icon"
                                                        className="absolute top-4 right-4 h-8 w-8 z-10"
                                                        onClick={() => removeImage(index)}><X
                                                    className="h-4 w-4"/></Button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious type="button"
                                                  className="absolute left-4 bg-black/50 text-white border-none hover:bg-black/75"/>
                                <CarouselNext type="button"
                                              className="absolute right-4 bg-black/50 text-white border-none hover:bg-black/75"/>
                            </Carousel>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center aspect-[21/9] w-full">
                                <ImageIcon className="h-16 w-16 text-muted-foreground"/>
                                <p className="mt-4 text-lg font-medium">Add cover photos for your event</p>
                                <Button type="button" className="mt-4"
                                        onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Upload
                                    Images</Button>
                            </div>
                        )}
                        <div className="mt-4 flex justify-center items-center gap-4">
                            {coverFiles.length > 0 && (<Button type="button" variant="outline"
                                                               onClick={() => fileInputRef.current?.click()}><PlusCircle
                                className="mr-2 h-4 w-4"/>Add More</Button>)}
                            <p className="text-sm text-muted-foreground">{coverFiles.length} of {maxPhotos} photos
                                selected.</p>
                        </div>
                        <Input id="picture" type="file" multiple accept="image/*" onChange={handleFileChange}
                               className="hidden" ref={fileInputRef}/>
                    </CardContent>
                </Card>

                {/* Event Details Card with Category dropdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                        <CardDescription>Provide the core information about your event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({field}) => (
                            <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input
                                placeholder="e.g., Annual Tech Conference 2025" {...field} /></FormControl><FormMessage/></FormItem>)}/>

                        {/* Category Selector as dropdown */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category for your event"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-100">
                                            {categories.map((parentCat) => (
                                                <SelectGroup key={parentCat.id}>
                                                    <SelectLabel>{parentCat.name}</SelectLabel>
                                                    {parentCat.subCategories.map((subCat) => (
                                                        <SelectItem key={subCat.id} value={subCat.id}>
                                                            {subCat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField control={form.control} name="description" render={({field}) => (
                            <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea
                                placeholder="A brief summary of your event." {...field} /></FormControl><FormMessage/></FormItem>)}/>
                        <FormField control={form.control} name="overview" render={({field}) => (
                            <FormItem><FormLabel>Overview</FormLabel><FormControl><Textarea
                                placeholder="Provide more details like schedule, speakers, etc."
                                className="min-h-32" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                        <CardDescription>Where will your event take place?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="isOnline" render={({field}) => (<FormItem
                            className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"><FormLabel>Online Event</FormLabel></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                        {form.watch('isOnline') ? (
                            <FormField control={form.control} name="onlineLink" render={({field}) => (
                                <FormItem><FormLabel>Online Link (e.g., Zoom)</FormLabel><FormControl><Input
                                    placeholder="https://zoom.us/j/1234567890" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                        ) : (
                            <FormField control={form.control} name="venueId" render={({field}) => (
                                <FormItem><FormLabel>Venue</FormLabel><Select onValueChange={field.onChange}
                                                                              defaultValue={field.value}><FormControl><SelectTrigger><SelectValue
                                    placeholder="Select a venue"/></SelectTrigger></FormControl><SelectContent>{venues.map(venue =>
                                    <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>)}<SelectItem
                                    value="new-venue" className="text-primary"><PlusCircle
                                    className="inline-block mr-2 h-4 w-4"/>Create New Venue</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end mt-8">
                    <Button type="submit">Next: Tiers & Pricing</Button>
                </div>
            </form>
        </FormProvider>
    )
}
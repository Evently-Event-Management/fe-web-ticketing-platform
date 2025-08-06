'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useFormContext} from 'react-hook-form'; // Use context instead of creating new form
import {useOrganization} from '@/providers/OrganizationProvider';
import {useLimits} from '@/providers/LimitProvider';
import {CategoryResponse} from '@/types/category';
import {getAllCategories} from '@/lib/actions/categoryActions';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
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
import {CreateEventFormData} from "@/lib/validators/event";

interface CoreDetailsStepProps {
    coverFiles: File[];
    setCoverFilesAction: React.Dispatch<React.SetStateAction<File[]>>;
}

export function CoreDetailsStep({coverFiles, setCoverFilesAction}: CoreDetailsStepProps) {
    const {organization} = useOrganization();
    const {myLimits} = useLimits();
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Use the form context from parent instead of creating a new form
    const {control} = useFormContext<CreateEventFormData>();

    const maxPhotos = myLimits?.eventLimits.maxCoverPhotos || 1;

    useEffect(() => {
        getAllCategories().then(setCategories);
    }, [organization]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if ((coverFiles.length + files.length) > maxPhotos) {
                toast.error(`You can only upload a maximum of ${maxPhotos} photos.`);
                return;
            }
            setCoverFilesAction(prev => [...prev, ...files]);
        }
    };

    const removeImage = (index: number) => {
        setCoverFilesAction(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
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
                    <FormField control={control} name="title" render={({field}) => (
                        <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input
                            placeholder="e.g., Annual Tech Conference 2025" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={control} name="categoryId" render={({field}) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue
                                    placeholder="Select a category for your event"/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.map((parentCat) => (
                                        <SelectGroup key={parentCat.id}>
                                            <SelectLabel>{parentCat.name}</SelectLabel>
                                            {parentCat.subCategories.map((subCat) => (
                                                <SelectItem key={subCat.id} value={subCat.id}>{subCat.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField control={control} name="description" render={({field}) => (
                        <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea
                            placeholder="A brief summary of your event." {...field} /></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={control} name="overview" render={({field}) => (
                        <FormItem><FormLabel>Overview</FormLabel><FormControl><Textarea
                            placeholder="Provide more details like schedule, speakers, etc."
                            className="min-h-32" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                </CardContent>
            </Card>
        </div>
    )
}
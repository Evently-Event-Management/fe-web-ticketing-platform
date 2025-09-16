'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useFormContext} from 'react-hook-form'; // Use context instead of creating new form
import {useOrganization} from '@/providers/OrganizationProvider';
import {useLimits} from '@/providers/LimitProvider';
import {CategoryResponse} from '@/types/category';
import {getAllCategories} from '@/lib/actions/categoryActions';
import {compressImage} from '@/lib/imageUtils';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
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
import {X, PlusCircle, ImageUp} from 'lucide-react';
import {toast} from 'sonner';
import Autoplay from 'embla-carousel-autoplay';
import {CreateEventFormData} from "@/lib/validators/event";
import {GeminiMarkdownEditor} from './GenAIMarkdownEditor';

interface CoreDetailsStepProps {
    coverFiles: File[];
    setCoverFilesAction: React.Dispatch<React.SetStateAction<File[]>>
}

export function CoreDetailsStep({coverFiles, setCoverFilesAction}: CoreDetailsStepProps) {
    const {organization} = useOrganization();
    const {myLimits} = useLimits();
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Use the form context from parent instead of creating a new form
    const {control, setValue, getValues} = useFormContext<CreateEventFormData>();

    const maxPhotos = myLimits?.eventLimits.maxCoverPhotos || 1;

    useEffect(() => {
        getAllCategories().then(setCategories);
    }, [organization]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            // Check if adding these files would exceed the maximum allowed
            if ((coverFiles.length + selectedFiles.length) > maxPhotos) {
                toast.error(`You can only upload a maximum of ${maxPhotos} photos.`);
                return;
            }

            // Define compression options for cover photos
            const coverPhotoCompressionOptions = {
                maxSizeMB: 1.5,            // Slightly larger than logos to maintain quality
                maxWidthOrHeight: 1920,    // HD resolution is good for cover photos
                useWebWorker: true,
                fileType: 'image/jpeg'     // JPEG works well for cover photos
            };

            // Show loading toast for long operations
            toast.loading('Processing images...');

            try {
                // Process files one by one with compression
                const processedFiles = await Promise.all(
                    selectedFiles.map(async (file) => {
                        return await compressImage(file, coverPhotoCompressionOptions);
                    })
                );

                // Add the compressed files to the state
                setCoverFilesAction(prev => [...prev, ...processedFiles]);
                toast.dismiss();
                toast.success(`${processedFiles.length} image(s) added successfully`);
            } catch (error) {
                console.error('Error processing images:', error);
                toast.dismiss();
                toast.error('Error processing images');
            }
        }
    };

    const removeImage = (index: number) => {
        setCoverFilesAction(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            {/* ++ Visually Enhanced Cover Photos Section */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Event Cover Photos</CardTitle>
                    <CardDescription>Upload up to {maxPhotos} high-quality images that represent your event. This is the
                        first thing attendees will see.</CardDescription>
                </CardHeader>
                <CardContent>
                    {coverFiles.length > 0 ? (
                        <div className="space-y-4">
                            <Carousel plugins={[Autoplay({delay: 4000, stopOnInteraction: true})]}>
                                <CarouselContent>
                                    {coverFiles.map((file, index) => (
                                        <CarouselItem key={index} className="relative">
                                            <div className="aspect-[16/9] w-full relative overflow-hidden rounded-lg">
                                                <Image src={URL.createObjectURL(file)} alt={`Cover photo ${index + 1}`}
                                                       fill className="object-cover"/>
                                                <Button type="button" variant="destructive" size="icon"
                                                        className="absolute top-3 right-3 h-8 w-8 z-10 opacity-80 hover:opacity-100"
                                                        onClick={() => removeImage(index)}><X
                                                    className="h-4 w-4"/></Button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious type="button" className="left-3"/>
                                <CarouselNext type="button" className="right-3"/>
                            </Carousel>
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={coverFiles.length >= maxPhotos}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Add More
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    {coverFiles.length} of {maxPhotos} uploaded
                                </p>
                            </div>
                        </div>
                    ) : (
                        // ++ Visually Enhanced Empty State
                        <div
                            className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <ImageUp className="h-8 w-8 text-primary"/>
                            </div>
                            <p className="text-lg font-semibold">Click to upload your cover photos</p>
                            <p className="mt-1 text-sm text-muted-foreground">Recommended size: 1920x1080px</p>
                        </div>
                    )}
                    <Input id="picture" type="file" multiple accept="image/*" onChange={handleFileChange}
                           className="hidden" ref={fileInputRef}/>
                </CardContent>
            </Card>

            {/* ++ Visually Enhanced Event Details Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Fill in the core information that will appear on your event page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <FormField control={control} name="title" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-base">Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Annual Tech Conference 2025" {...field} />
                            </FormControl>
                            <FormDescription>The main headline for your event.</FormDescription>
                            <FormMessage/>
                        </FormItem>)}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={control} name="categoryId" render={({field}) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        // ✅ Find the full category object to get its name
                                        let selectedCategoryName: string | undefined;
                                        for (const parentCat of categories) {
                                            const subCat = parentCat.subCategories.find(sc => sc.id === value);
                                            if (subCat) {
                                                selectedCategoryName = subCat.name;
                                                break;
                                            }
                                        }
                                        // ✅ Set both the ID and the name in the form state
                                        field.onChange(value);
                                        setValue('categoryName', selectedCategoryName);
                                    }}
                                    defaultValue={field.value}
                                >
                                    <FormControl><SelectTrigger><SelectValue
                                        placeholder="Select a category for your event"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories.map((parentCat) => (
                                            <SelectGroup key={parentCat.id}>
                                                <SelectLabel>{parentCat.name}</SelectLabel>
                                                {parentCat.subCategories.map((subCat) => (
                                                    <SelectItem key={subCat.id}
                                                                value={subCat.id}>{subCat.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    </div>

                    <FormField control={control} name="description" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-base">Short Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="A brief, catchy summary of your event (1-2 sentences)." {...field} />
                            </FormControl>
                            <FormDescription>This appears in event listings and search results.</FormDescription>
                            <FormMessage/>
                        </FormItem>)}/>

                    {/* The GeminiMarkdownEditor is already well-styled and acts as its own section */}
                    <FormField
                        control={control}
                        name="overview"
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <GeminiMarkdownEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        getValues={getValues}
                                        organizationName={organization?.name || 'Our Organization'}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                </CardContent>
            </Card>
        </div>
    )
}

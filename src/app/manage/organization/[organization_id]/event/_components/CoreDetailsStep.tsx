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
import {X, PlusCircle, ImageUp, Sparkles, Tag, Quote, ScrollText} from 'lucide-react';
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
        <div className="space-y-10">
            <header className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-[0.2em]">
                    <Sparkles className="h-4 w-4"/>
                    Event Identity
                </div>
                <h2 className="text-3xl font-semibold text-foreground">Set the tone for your experience</h2>
                <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
                    Craft a first impression that feels memorable. Start with the visuals, then give us the essentials—short, sharp, and ready for attendees.
                </p>
            </header>

            <section className="space-y-6">
                <div className="flex flex-col gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ImageUp className="h-4 w-4 text-primary"/>
                        Showcase imagery
                    </span>
                    {coverFiles.length > 0 ? (
                        <div className="space-y-4">
                            <Carousel plugins={[Autoplay({delay: 4000, stopOnInteraction: true})]}>
                                <CarouselContent>
                                    {coverFiles.map((file, index) => (
                                        <CarouselItem key={index} className="relative">
                                            <div className="aspect-[16/9] w-full relative overflow-hidden rounded-xl bg-muted">
                                                <Image src={URL.createObjectURL(file)} alt={`Cover photo ${index + 1}`}
                                                       fill className="object-cover"/>
                                                <Button type="button" variant="destructive" size="icon"
                                                        className="absolute top-3 right-3 h-8 w-8 z-10 opacity-80 hover:opacity-100"
                                                        onClick={() => removeImage(index)}>
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious type="button" className="left-3"/>
                                <CarouselNext type="button" className="right-3"/>
                            </Carousel>
                            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={coverFiles.length >= maxPhotos}
                                    className="rounded-full px-5"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Add another image
                                </Button>
                                <span className="text-muted-foreground">
                                    {coverFiles.length} / {maxPhotos} uploaded
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center border border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <ImageUp className="h-8 w-8 text-primary"/>
                            </div>
                            <p className="text-lg font-medium text-foreground">Drop in vibrant cover art</p>
                            <p className="mt-1 text-sm text-muted-foreground">Tip: 1920×1080px keeps everything crisp.</p>
                        </div>
                    )}
                    <Input id="picture" type="file" multiple accept="image/*" onChange={handleFileChange}
                           className="hidden" ref={fileInputRef}/>
                </div>
            </section>

            <section className="space-y-8">
                <FormField control={control} name="title" render={({field}) => (
                    <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground uppercase tracking-[0.2em]">
                            <Sparkles className="h-4 w-4 text-primary"/>
                            Event Name
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Give your gathering a distinctive title"
                                className="h-12 text-base"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField control={control} name="categoryId" render={({field}) => (
                    <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground uppercase tracking-[0.2em]">
                            <Tag className="h-4 w-4 text-primary"/>
                            Category
                        </FormLabel>
                        <Select
                            onValueChange={(value) => {
                                let selectedCategoryName: string | undefined;
                                for (const parentCat of categories) {
                                    const subCat = parentCat.subCategories.find(sc => sc.id === value);
                                    if (subCat) {
                                        selectedCategoryName = subCat.name;
                                        break;
                                    }
                                }
                                field.onChange(value);
                                setValue('categoryName', selectedCategoryName);
                            }}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Choose where it belongs"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((parentCat) => (
                                    <SelectGroup key={parentCat.id}>
                                        <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                            {parentCat.name}
                                        </SelectLabel>
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
                )}/>

                <FormField control={control} name="description" render={({field}) => (
                    <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground uppercase tracking-[0.2em]">
                            <Quote className="h-4 w-4 text-primary"/>
                            Tagline
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="A compact hook that fits in listings and social previews"
                                className="min-h-[120px] text-base"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>

                <div className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground uppercase tracking-[0.2em]">
                        <ScrollText className="h-4 w-4 text-primary"/>
                        Full Overview
                    </span>
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
                </div>
            </section>
        </div>
    )
}

"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useEventContext } from "@/providers/EventProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { UpdateEventRequest, updateEventDetails, uploadEventCoverPhoto, removeCoverPhoto } from "@/lib/actions/eventUpdateActions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ImageUp, X, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { GeminiMarkdownEditor } from "@/app/manage/organization/[organization_id]/event/_components/GenAIMarkdownEditor";
import { useOrganization } from "@/providers/OrganizationProvider";

// Define validation schema for event updates
const updateEventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(255),
  description: z.string().optional(),
  overview: z.string().optional(),
});

type UpdateEventForm = z.infer<typeof updateEventSchema>;

export default function EventSettingsPage() {
  const { event, refetchEventData, isLoading } = useEventContext();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState("cover-photos");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const form = useForm<UpdateEventForm>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      overview: event?.overview || "",
    },
  });

  // Update form when event data changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || "",
        overview: event.overview || "",
      });
    }
  }, [event, form]);

  const onSubmit = async (data: UpdateEventForm) => {
    if (!event?.id) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the update request
      const updateRequest: UpdateEventRequest = {
        title: data.title,
        description: data.description,
        overview: data.overview,
      };
      
      // Update the event details
      await updateEventDetails(event.id, updateRequest);
      
      // Handle cover photo uploads if any
      if (coverFiles.length > 0) {
        const uploadPromises = coverFiles.map(file => uploadEventCoverPhoto(event.id, file));
        const results = await Promise.all(uploadPromises);
        
        // Check if all uploads succeeded
        const failedUploads = results.filter(r => !r.success);
        if (failedUploads.length > 0) {
          toast.error(`${failedUploads.length} images failed to upload.`);
        } else {
          toast.success("All images uploaded successfully.");
        }
      }
      
      // Refresh event data to show updated information
      await refetchEventData();
      toast.success("Event details updated successfully.");
      setCoverFiles([]);
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to update event details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    const maxPhotos = 5;
    
    // Check if adding these files would exceed the maximum allowed
    if (selectedFiles.length > maxPhotos) {
      toast.error(`You can only upload a maximum of ${maxPhotos} photos.`);
      return;
    }
    
    // Define compression options for cover photos
    const coverPhotoCompressionOptions = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    
    toast.loading('Processing images...');
    
    try {
      // Process files one by one with compression
      const processedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          return await compressImage(file, coverPhotoCompressionOptions);
        })
      );
      
      // Add the compressed files to the state
      setCoverFiles(prev => [...prev, ...processedFiles]);
      toast.dismiss();
      toast.success(`${processedFiles.length} image(s) added successfully`);
    } catch (error) {
      console.error('Error processing images:', error);
      toast.dismiss();
      toast.error('Error processing images');
    }
  };

  const handleRemoveCoverPhoto = async (photoId: string) => {
    if (!event?.id) return;
    
    try {
      await removeCoverPhoto(event.id, photoId);
      await refetchEventData();
      toast.success("Cover photo removed successfully.");
    } catch (error) {
      console.error("Failed to remove cover photo:", error);
      toast.error("Failed to remove cover photo. Please try again.");
    }
  };

  const removeImageFromUpload = (index: number) => {
    setCoverFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading || !event) {
    return (
      <div className="p-4 md:p-8 w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Event Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
            <TabsTrigger value="cover-photos">Cover Photos</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="details" className="space-y-8">
                <div className="space-y-8">
                  {/* Event Details Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Event Details</h3>
                      <p className="text-sm text-muted-foreground">Update the core information that appears on your event page.</p>
                    </div>

                    <FormField control={form.control} name="title" render={({field}) => (
                      <FormItem>
                        <FormLabel className="text-base">Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Annual Tech Conference 2025" {...field} />
                        </FormControl>
                        <FormDescription>The main headline for your event.</FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    <FormField control={form.control} name="description" render={({field}) => (
                      <FormItem>
                        <FormLabel className="text-base">Short Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief, catchy summary of your event (1-2 sentences)." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>This appears in event listings and search results.</FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    {/* Overview with GeminiMarkdownEditor */}
                    <div className="border-t pt-6">
                      <FormField
                        control={form.control}
                        name="overview"
                        render={({field}) => (
                          <FormItem>
                            <FormControl>
                              <GeminiMarkdownEditor
                                value={field.value || ''}
                                onChange={field.onChange}
                                getValues={form.getValues as any}
                                organizationName={organization?.name || 'Our Organization'}
                              />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cover-photos" className="space-y-8">
                <div className="space-y-8">
                  {/* Cover Photos Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Event Cover Photos</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload high-quality images that represent your event. These will be shown to potential attendees.
                      </p>
                    </div>

                    {/* Current Photos */}
                    {event.coverPhotos && event.coverPhotos.length > 0 && (
                      <div className="space-y-4 border-b pb-6">
                        <h4 className="font-medium">Current Photos</h4>
                        <Carousel className="w-full">
                          <CarouselContent>
                            {event.coverPhotos.map((photo, index) => (
                              <CarouselItem key={index}>
                                <div className="relative rounded-lg overflow-hidden aspect-video">
                                  <img 
                                    src={photo} 
                                    alt={`Event cover ${index + 1}`} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-2">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete cover photo?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this cover photo.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => {
                                              // Extract the photoId from the URL
                                              const photoId = photo.split('/').pop()?.split('.')[0];
                                              if (photoId) {
                                                handleRemoveCoverPhoto(photoId);
                                              }
                                            }}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                      </div>
                    )}
                    
                    {/* Upload new photos section */}
                    <div className="pt-4">
                      <h4 className="font-medium mb-4">Upload New Photos</h4>
                      
                      {coverFiles.length > 0 ? (
                        <div className="space-y-4">
                          <Carousel className="w-full">
                            <CarouselContent>
                              {coverFiles.map((file, index) => (
                                <CarouselItem key={index} className="relative">
                                  <div className="aspect-[16/9] w-full relative overflow-hidden rounded-lg">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`New cover ${index + 1}`} 
                                      className="object-cover w-full h-full"
                                    />
                                    <Button 
                                      type="button" 
                                      variant="destructive" 
                                      size="icon"
                                      className="absolute top-3 right-3 h-8 w-8 z-10 opacity-80 hover:opacity-100"
                                      onClick={() => removeImageFromUpload(index)}
                                    >
                                      <X className="h-4 w-4"/>
                                    </Button>
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
                              disabled={coverFiles.length >= 5}
                            >
                              <ImageUp className="mr-2 h-4 w-4"/>
                              Add More
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => setCoverFiles([])}
                            >
                              Clear All
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              {coverFiles.length} of 5 uploaded
                            </p>
                          </div>
                          
                          <div className="flex justify-end mt-6">
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="flex items-center gap-2"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <ImageUp className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-lg font-semibold">Click to upload your cover photos</p>
                          <p className="mt-1 text-sm text-muted-foreground">Recommended size: 1920x1080px</p>
                        </div>
                      )}
                      
                      <Input
                        id="picture"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {toast} from 'sonner';
import {GoogleMap, useJsApiLoader, Marker} from '@react-google-maps/api';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form';
import {Checkbox} from '@/components/ui/checkbox';
import {Skeleton} from '@/components/ui/skeleton';

const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
    borderRadius: 'var(--radius)',
};

// Default center for the map (Colombo, Sri Lanka)
const DEFAULT_MAP_CENTER = {
    lat: 6.9271,
    lng: 79.8612,
};

const LIBRARIES: ("places")[] = ['places'];

export function LocationConfigDialog({index, open, setOpenAction}: {
    index: number;
    open: boolean;
    setOpenAction: (open: boolean) => void
}) {
    const {control, watch, getValues, setValue} = useFormContext<CreateEventFormData>();
    const isOnline = watch(`sessions.${index}.isOnline`);
    const venueDetails = watch(`sessions.${index}.venueDetails`);

    const [applyToAll, setApplyToAll] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
        venueDetails?.latitude && venueDetails?.longitude
            ? {lat: venueDetails.latitude, lng: venueDetails.longitude}
            : DEFAULT_MAP_CENTER
    );
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (markerPosition) {
            setValue(`sessions.${index}.venueDetails.latitude`, markerPosition.lat, {shouldValidate: true});
            setValue(`sessions.${index}.venueDetails.longitude`, markerPosition.lng, {shouldValidate: true});
        }
    }, [markerPosition, index, setValue]);

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: LIBRARIES,
    });

    // Configure Google Places Autocomplete after loading
    useEffect(() => {
        if (isLoaded && autocompleteRef.current && autocompleteInputRef.current) {
            // Ensure autocomplete suggestions appear above the dialog
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => {
                (container as HTMLElement).style.zIndex = '9999';
            });
        }
    }, [isLoaded]);
    useEffect(() => {
        if (venueDetails?.latitude && venueDetails?.longitude) {
            setMarkerPosition({lat: venueDetails.latitude, lng: venueDetails.longitude});
        }
    }, [venueDetails]);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const newPos = {lat: event.latLng.lat(), lng: event.latLng.lng()};
            setMarkerPosition(newPos);
        }
    };

    // const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    //     autocompleteRef.current = autocomplete;
    // };
    //
    // const onPlaceChanged = () => {
    //     console.log('Place changed:', autocompleteRef.current?.getPlace());
    //     if (autocompleteRef.current) {
    //         const place = autocompleteRef.current.getPlace();
    //         if (place.geometry?.location) {
    //             const newPos = {
    //                 lat: place.geometry.location.lat(),
    //                 lng: place.geometry.location.lng(),
    //             };
    //             setMarkerPosition(newPos);
    //             setValue(`sessions.${index}.venueDetails.name`, place.name || '', {shouldValidate: true});
    //             setValue(`sessions.${index}.venueDetails.address`, place.formatted_address || '', {shouldValidate: true});
    //             setValue(`sessions.${index}.venueDetails.latitude`, newPos.lat, {shouldValidate: true});
    //             setValue(`sessions.${index}.venueDetails.longitude`, newPos.lng, {shouldValidate: true});
    //         }
    //     }
    // };

    const handleSave = () => {
        console.log(watch(`sessions.${index}`));
        if (applyToAll) {
            const currentSessionData = getValues(`sessions.${index}`);
            const allSessions = getValues('sessions');
            allSessions.forEach((_, i) => {
                setValue(`sessions.${i}.isOnline`, currentSessionData.isOnline);
                setValue(`sessions.${i}.onlineLink`, currentSessionData.onlineLink);
                setValue(`sessions.${i}.venueDetails`, currentSessionData.venueDetails);
                setValue(`sessions.${i}.layoutData`, currentSessionData.layoutData);
            });
            toast.success("Location details applied to all sessions.");
        }
        setOpenAction(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpenAction}>
            {/* ✅ Restructured Dialog for better overflow handling */}
            <DialogContent className="sm:max-w-6xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Configure Location for Session {index + 1}</DialogTitle>
                </DialogHeader>

                {/* ✅ Main content area is now scrollable */}
                <div className="overflow-y-auto">
                    <Tabs
                        defaultValue={isOnline ? "online" : "physical"}
                        onValueChange={(value) => {
                            const isOnlineTab = value === 'online';
                            setValue(`sessions.${index}.isOnline`, isOnlineTab);
                            setValue(`sessions.${index}.layoutData`, {name: null, layout: {blocks: []}});
                            if (isOnlineTab) {
                                // ✅ Remove venueDetails when switching to online
                                setValue(`sessions.${index}.venueDetails`, undefined);
                            } else {
                                // ✅ Remove onlineLink when switching to physical
                                setValue(`sessions.${index}.onlineLink`, undefined);
                            }
                        }}
                        className="w-full"
                    >
                        <TabsList className="mx-6 mt-4">
                            <TabsTrigger value="physical">Physical</TabsTrigger>
                            <TabsTrigger value="online">Online</TabsTrigger>
                        </TabsList>
                        <TabsContent value="physical" className={'px-4 py-0'}>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Left Side - Form Fields */}
                                <div className="space-y-4 p-6">
                                    <FormField control={control} name={`sessions.${index}.venueDetails.name`}
                                               render={({field}) => (
                                                   <FormItem><FormLabel>Venue Name</FormLabel><FormControl><Input
                                                       placeholder="e.g., Grand Hall" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                    <FormField control={control} name={`sessions.${index}.venueDetails.address`}
                                               render={({field}) => (
                                                   <FormItem><FormLabel>Address</FormLabel><FormControl><Input
                                                       placeholder="Street, City" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                    <div className="text-sm text-muted-foreground pt-4">
                                        <p>Use the map to locate the venue precisely. You can:</p>
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li>Search for a venue using the search box.</li>
                                            <li>Click on the map to place a marker.</li>
                                            <li>Drag the marker to fine-tune the location.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Side - Map */}
                                <div className="flex flex-col md:h-full gap-4">
                                    {isLoaded ? (
                                        <>
                                            {/*
                                              * Autocomplete functionality temporarily disabled
                                              * TODO: Fix this to properly handle clickable suggestions
                                              */}
                                            {/*
                                            <Autocomplete
                                                onLoad={onAutocompleteLoad}
                                                className={'!z-10'}
                                                onPlaceChanged={() => {
                                                    console.log('Place changed');
                                                }}
                                            >
                                                <Input
                                                    type="text"
                                                    placeholder="Search for a location..."
                                                    className="w-full shadow-md"
                                                />
                                            </Autocomplete>
                                            */}

                                            {/* Simple input field while autocomplete is disabled */}
                                            <Input
                                                type="text"
                                                placeholder="Search functionality coming soon..."
                                                className="w-full shadow-md opacity-70"
                                                disabled
                                            />

                                            <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={markerPosition}
                                                       zoom={15} onClick={handleMapClick}>
                                                <Marker
                                                    position={markerPosition}
                                                    draggable={true}
                                                    onDragEnd={(e) => {
                                                        if (e.latLng) {
                                                            const newPos = {lat: e.latLng.lat(), lng: e.latLng.lng()};
                                                            setMarkerPosition(newPos); // useEffect will push to form
                                                        }
                                                    }}
                                                />
                                            </GoogleMap>
                                        </>
                                    ) : <Skeleton className="h-full w-full"/>}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="online" className="p-6">
                            <FormField control={control} name={`sessions.${index}.onlineLink`} render={({field}) => (
                                <FormItem><FormLabel>Online Link</FormLabel><FormControl><Input
                                    placeholder="https://zoom.us/..." {...field} /></FormControl><FormMessage/></FormItem>)}/>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="justify-between p-6 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="apply-to-all" checked={applyToAll}
                                  onCheckedChange={(checked) => setApplyToAll(checked === true)}/>
                        <Label htmlFor="apply-to-all">Apply to all sessions</Label>
                    </div>
                    <Button type="button" onClick={handleSave}>Save Location</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

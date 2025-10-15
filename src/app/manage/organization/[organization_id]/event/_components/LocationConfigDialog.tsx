"use client"

import * as React from 'react';
import {FormEvent, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {toast} from 'sonner';
import {MapContainer, TileLayer, Marker, useMap, useMapEvents} from 'react-leaflet';
import L, {LatLngLiteral} from 'leaflet';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
// import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'; // Temporarily disabled
import {Checkbox} from '@/components/ui/checkbox';
import {Skeleton} from '@/components/ui/skeleton';

import 'leaflet/dist/leaflet.css';
import {SessionType} from "@/types/enums/sessionType";

// Default center for the map (Colombo, Sri Lanka)
const DEFAULT_MAP_CENTER: LatLngLiteral = {
    lat: 6.9271,
    lng: 79.8612,
};

// Fix for default Leaflet marker icons
// Using proper typing for the Leaflet Icon prototype
interface IconDefaultPrototype extends L.Icon.Default {
    _getIconUrl?: unknown;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// Small helper to handle map clicks
function LocationMarker({setMarkerPosition}: { setMarkerPosition: (pos: LatLngLiteral) => void }) {
    useMapEvents({
        click(e) {
            setMarkerPosition(e.latlng);
        }
    });
    return null;
}

function MapViewUpdater({position}: { position: LatLngLiteral }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, map.getZoom(), {
            animate: true,
            duration: 0.6,
        });
    }, [map, position]);

    return null;
}

type LocationSearchResult = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
};

export function LocationConfigDialog({index, open, setOpenAction}: {
    index: number;
    open: boolean;
    setOpenAction: (open: boolean) => void
}) {
    const {getValues, setValue} = useFormContext<CreateEventFormData>();

    // Local form state
    const [localFormState, setLocalFormState] = useState({
        sessionType: SessionType.PHYSICAL, // Force physical
        venueDetails: {
            name: '',
            address: '',
            onlineLink: '',
            latitude: DEFAULT_MAP_CENTER.lat,
            longitude: DEFAULT_MAP_CENTER.lng,
        }
    });
    const [applyToAll, setApplyToAll] = useState(false);
    const [localErrors, setLocalErrors] = useState<{
        venueName?: string;
        onlineLink?: string;
    }>({});

    const [markerPosition, setMarkerPosition] = useState<LatLngLiteral>(DEFAULT_MAP_CENTER);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const updateMarkerPosition = (pos: LatLngLiteral) => {
        setMarkerPosition(pos);
        setLocalFormState(prev => ({
            ...prev,
            venueDetails: {
                ...prev.venueDetails,
                latitude: pos.lat,
                longitude: pos.lng,
            }
        }));
    };

    // Snapshot form values when dialog opens
    useEffect(() => {
        if (open) {
            const sessionData = getValues(`sessions.${index}`);
            setLocalFormState({
                sessionType: SessionType.PHYSICAL, // Force physical
                venueDetails: {
                    name: sessionData.venueDetails?.name || '',
                    address: sessionData.venueDetails?.address || '',
                    onlineLink: sessionData.venueDetails?.onlineLink || '',
                    latitude: sessionData.venueDetails?.latitude ?? DEFAULT_MAP_CENTER.lat,
                    longitude: sessionData.venueDetails?.longitude ?? DEFAULT_MAP_CENTER.lng,
                }
            });

            setMarkerPosition({
                lat: sessionData.venueDetails?.latitude ?? DEFAULT_MAP_CENTER.lat,
                lng: sessionData.venueDetails?.longitude ?? DEFAULT_MAP_CENTER.lng
            });

            setLocalErrors({});
            setSearchQuery(sessionData.venueDetails?.address || sessionData.venueDetails?.name || '');
            setSearchResults([]);
            setSearchError(null);
        }
    }, [open, getValues, index]);

    // Keep marker synced with form state
    useEffect(() => {
        if (localFormState.sessionType === SessionType.PHYSICAL) {
            setMarkerPosition({
                lat: localFormState.venueDetails.latitude ?? DEFAULT_MAP_CENTER.lat,
                lng: localFormState.venueDetails.longitude ?? DEFAULT_MAP_CENTER.lng
            });
        }
    }, [
        localFormState.venueDetails.latitude,
        localFormState.venueDetails.longitude,
        localFormState.sessionType
    ]);

    const performSearch = async (query: string) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 3) {
            setSearchError('Please enter at least 3 characters to search.');
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            setSearchError(null);
            setSearchResults([]);

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(trimmedQuery)}&email=${encodeURIComponent('support@ticketly.lk')}`, {
                headers: {Accept: 'application/json'}
            });

            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data: LocationSearchResult[] = await response.json();
            if (!data.length) {
                setSearchError('No locations found. Try another search.');
                setSearchResults([]);
                return;
            }

            setSearchResults(data);
        } catch (error) {
            console.error('Location search failed', error);
            setSearchError('Unable to search locations right now. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void performSearch(searchQuery);
    };

    const handleResultSelect = (result: LocationSearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const newPosition = {lat, lng};

        updateMarkerPosition(newPosition);
        setLocalFormState(prev => ({
            ...prev,
            venueDetails: {
                ...prev.venueDetails,
                address: result.display_name,
                name: prev.venueDetails.name || result.name || result.display_name.split(',')[0]?.trim() || '',
            }
        }));
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    // Local validation
    const validateLocalState = () => {
        const errors: { venueName?: string; onlineLink?: string } = {};

        if (!localFormState.venueDetails.name) {
            errors.venueName = "Venue name is required";
        }

        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        const isValid = validateLocalState();
        if (!isValid) return;

        setValue(`sessions.${index}.sessionType`, SessionType.PHYSICAL, {shouldValidate: true});
        setValue(`sessions.${index}.venueDetails`, {
            name: localFormState.venueDetails.name,
            address: localFormState.venueDetails.address,
            latitude: localFormState.venueDetails.latitude,
            longitude: localFormState.venueDetails.longitude
        }, {shouldValidate: true});
        
        setValue(`sessions.${index}.layoutData`, {name: null, layout: {blocks: []}}, {shouldValidate: true});

        if (applyToAll) {
            const allSessions = getValues('sessions');
            allSessions.forEach((_, i) => {
                if (i === index) return;

                setValue(`sessions.${i}.sessionType`, SessionType.PHYSICAL, {shouldValidate: true});
                setValue(`sessions.${i}.venueDetails`, {
                    name: localFormState.venueDetails.name,
                    address: localFormState.venueDetails.address,
                    latitude: localFormState.venueDetails.latitude,
                    longitude: localFormState.venueDetails.longitude
                }, {shouldValidate: true});
                
                setValue(`sessions.${i}.layoutData`, {name: null, layout: {blocks: []}}, {shouldValidate: true});
            });
            toast.success("Location details applied to all sessions.");
        }

        setOpenAction(false);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setLocalFormState(prev => ({
            ...prev,
            venueDetails: {
                ...prev.venueDetails,
                [field]: value
            }
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpenAction}>
            <DialogContent className="sm:max-w-6xl grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Configure Location for Session {index + 1}</DialogTitle>
                </DialogHeader>
                
                <div className="overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left Side */}
                        <div className="space-y-4 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="venue-name">Venue Name</Label>
                                <Input
                                    id="venue-name"
                                    placeholder="e.g., Grand Hall"
                                    value={localFormState.venueDetails.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                                {localErrors.venueName && (
                                    <p className="text-sm text-destructive">{localErrors.venueName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="venue-address">Address</Label>
                                <Input
                                    id="venue-address"
                                    placeholder="Street, City"
                                    value={localFormState.venueDetails.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground pt-4">
                                <p>Use the map to locate the venue precisely. You can:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Click on the map to place a marker.</li>
                                    <li>Drag the marker to fine-tune the location.</li>
                                    <li>Search for a location using the search box.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Side - Map */}
                        <div className="flex flex-col md:h-full gap-4">
                            <form onSubmit={handleSearchSubmit} className="space-y-2">
                                <Label htmlFor={`venue-search-${index}`}>Search Location</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        id={`venue-search-${index}`}
                                        placeholder="Search for a venue or address"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (searchError) {
                                                setSearchError(null);
                                            }
                                        }}
                                    />
                                    <Button type="submit" disabled={isSearching}>
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </Button>
                                </div>
                                {searchError && (
                                    <p className="text-sm text-destructive">{searchError}</p>
                                )}
                            </form>
                            {searchResults.length > 0 && (
                                <div className="space-y-2 rounded-md border border-border bg-background/80 p-3 max-h-48 overflow-y-auto">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.place_id}
                                            type="button"
                                            className="w-full text-left text-sm rounded-md p-2 hover:bg-muted transition-colors"
                                            onClick={() => handleResultSelect(result)}
                                        >
                                            <span className="font-medium text-foreground block">
                                                {result.name || result.display_name.split(',')[0]}
                                            </span>
                                            <span className="text-muted-foreground text-xs block">
                                                {result.display_name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {open ? (
                                <MapContainer
                                    center={markerPosition}
                                    zoom={15}
                                    style={{width: '100%', height: '350px', borderRadius: 'var(--radius)'}}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={markerPosition}
                                        draggable={true}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const marker = e.target as L.Marker;
                                                const pos = marker.getLatLng();
                                                updateMarkerPosition(pos);
                                            }
                                        }}
                                    />
                                    <LocationMarker setMarkerPosition={updateMarkerPosition}/>
                                    <MapViewUpdater position={markerPosition}/>
                                </MapContainer>
                            ) : <Skeleton className="h-full w-full"/>}
                        </div>
                    </div>
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

'use client'

import * as React from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLngLiteral } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import 'leaflet/dist/leaflet.css';
import { SessionType } from "@/types/enums/sessionType";
import * as z from 'zod';
import {VenueDetails} from "@/lib/validators/event";


// --- Component Props ---
interface LocationConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionType: SessionType;
    initialData?: VenueDetails;
    onSave: (venueDetails: VenueDetails) => void; // Simplified onSave
    sessionIndex: number;
}

// --- Leaflet Icon Fix & Map Helpers ---
const DEFAULT_MAP_CENTER: LatLngLiteral = { lat: 6.9271, lng: 79.8612 };
interface IconDefaultPrototype extends L.Icon.Default { _getIconUrl?: unknown; }
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function LocationMarker({ setMarkerPosition }: { setMarkerPosition: (pos: LatLngLiteral) => void }) {
    useMapEvents({ click(e) { setMarkerPosition(e.latlng); } });
    return null;
}

function MapViewUpdater({ position }: { position: LatLngLiteral }) {
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

// --- The Standalone Dialog Component ---
export function LocationEditDialog({
                                         open,
                                         onOpenChange,
                                         sessionType,
                                         initialData,
                                         onSave,
                                         sessionIndex
                                     }: LocationConfigDialogProps) {

    const [localFormState, setLocalFormState] = useState<VenueDetails>({});
    const [localErrors, setLocalErrors] = useState<{ venueName?: string; onlineLink?: string }>({});
    const [markerPosition, setMarkerPosition] = useState<LatLngLiteral>(DEFAULT_MAP_CENTER);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const updateMarkerPosition = (pos: LatLngLiteral) => {
        setMarkerPosition(pos);
        setLocalFormState(prev => ({
            ...prev,
            latitude: pos.lat,
            longitude: pos.lng,
        }));
    };

    useEffect(() => {
        if (open) {
            const data = initialData || {};
            setLocalFormState(data);

            const position = {
                lat: data.latitude ?? DEFAULT_MAP_CENTER.lat,
                lng: data.longitude ?? DEFAULT_MAP_CENTER.lng,
            };
            setMarkerPosition(position);
            setLocalErrors({});
            setSearchQuery('');
            setSearchResults([]);
            setSearchError(null);
        }
    }, [open, initialData]);

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

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(trimmedQuery)}&email=${encodeURIComponent('support@ticketly.lk')}`, {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch location results.');
            }

            const data: LocationSearchResult[] = await response.json();
            if (!data.length) {
                setSearchError('No locations found. Try a different search term.');
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
        const newPosition = { lat, lng };

        updateMarkerPosition(newPosition);
        setLocalFormState(prev => ({
            ...prev,
            address: result.display_name,
            name: prev.name || result.name || result.display_name.split(',')[0]?.trim()
        }));
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    const validateLocalState = (): boolean => {
        const errors: { venueName?: string; onlineLink?: string } = {};
        if (sessionType === SessionType.PHYSICAL && !localFormState.name) {
            errors.venueName = "Venue name is required";
        }
        if (sessionType === SessionType.ONLINE) {
            if (!localFormState.onlineLink) {
                errors.onlineLink = "Online link is required";
            } else {
                const result = z.string().url().safeParse(localFormState.onlineLink);
                if (!result.success) {
                    errors.onlineLink = "Must be a valid URL";
                }
            }
        }
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (!validateLocalState()) return;

        const saveData: VenueDetails =
            sessionType === SessionType.PHYSICAL
                ? {
                    name: localFormState.name,
                    address: localFormState.address,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                }
                : {
                    onlineLink: localFormState.onlineLink,
                };

        // Directly call onSave with just the venue details
        onSave(saveData);
        toast.success(`Location for session ${sessionIndex + 1} updated.`);
        onOpenChange(false);
    };

    const handleInputChange = (field: keyof VenueDetails, value: string) => {
        setLocalFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleMarkerDragEnd = (e: L.LeafletEvent) => {
        const marker = e.target as L.Marker;
        const pos = marker.getLatLng();
        updateMarkerPosition(pos);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh] z-50">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Edit Location for Session {sessionIndex + 1}</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-6">
                    {sessionType === SessionType.PHYSICAL ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="venue-name">Venue Name</Label>
                                    <Input id="venue-name" value={localFormState.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
                                    {localErrors.venueName && <p className="text-sm text-destructive">{localErrors.venueName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="venue-address">Address</Label>
                                    <Input id="venue-address" value={localFormState.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col h-full gap-4">
                                <form onSubmit={handleSearchSubmit} className="space-y-2">
                                    <Label htmlFor="venue-search">Search Location</Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            id="venue-search"
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
                                    <div className="relative z-[60]">
                                        <MapContainer center={markerPosition} zoom={15} style={{ width: '100%', height: '300px', borderRadius: 'var(--radius)' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={markerPosition} draggable={true} eventHandlers={{ dragend: handleMarkerDragEnd }} />
                                            <LocationMarker setMarkerPosition={updateMarkerPosition} />
                                            <MapViewUpdater position={markerPosition} />
                                        </MapContainer>
                                    </div>
                                ) : <Skeleton className="h-full w-full" />}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="online-link">Online Meeting Link</Label>
                            <Input id="online-link" value={localFormState.onlineLink || ''} onChange={(e) => handleInputChange('onlineLink', e.target.value)} />
                            {localErrors.onlineLink && <p className="text-sm text-destructive">{localErrors.onlineLink}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t bg-muted/40">
                    <Button type="button" onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
                    <Button type="button" onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
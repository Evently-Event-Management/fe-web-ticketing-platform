'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import React, {useCallback, useState} from 'react';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {sriLankaLocations} from '../../_utils/locations';
import {Search, MapPin} from 'lucide-react';

const DEFAULT_RADIUS_KM = '30';

// The component is now much simpler, with no props needed.
export function EventFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Use local state to handle input values before searching
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [location, setLocation] = useState(searchParams.get('location') || 'all');
    const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(() => {
        const latitudeParam = searchParams.get('latitude');
        const longitudeParam = searchParams.get('longitude');
        if (!latitudeParam || !longitudeParam) return null;
        const latitude = Number(latitudeParam);
        const longitude = Number(longitudeParam);
        return Number.isFinite(latitude) && Number.isFinite(longitude) ? {latitude, longitude} : null;
    });
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const requestUserLocation = useCallback(() => {
        if (typeof window === 'undefined') {
            setLocationError('Location is unavailable in this environment.');
            return;
        }
        if (!navigator?.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
                setIsFetchingLocation(false);
            },
            (error) => {
                setIsFetchingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Location permission denied. Please enable it to search nearby events.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Unable to determine your location right now.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Fetching your location timed out. Please try again.');
                        break;
                    default:
                        setLocationError('Something went wrong while fetching your location.');
                }
            }
        );
    }, []);

    const handleLocationChange = useCallback((value: string) => {
        setLocation(value);
        if (value === 'nearby') {
            setLocationError(null);
            requestUserLocation();
        } else {
            setCoordinates(null);
            setLocationError(null);
        }
    }, [requestUserLocation]);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        const params = new URLSearchParams(searchParams.toString());

        // Set or delete the search term
        if (searchTerm) {
            params.set('searchTerm', searchTerm);
        } else {
            params.delete('searchTerm');
        }

        // Handle location and its coordinates
        if (location === 'all') {
            params.delete('location');
            params.delete('latitude');
            params.delete('longitude');
            params.delete('radiusKm');
        } else if (location === 'nearby') {
            if (!coordinates) {
                setLocationError('We need your location to search nearby events.');
                return;
            }
            params.set('location', 'nearby');
            params.set('latitude', coordinates.latitude.toString());
            params.set('longitude', coordinates.longitude.toString());
            params.set('radiusKm', DEFAULT_RADIUS_KM);
        } else {
            const locData = sriLankaLocations.find(l => l.name === location);
            if (locData) {
                params.set('location', locData.name);
                params.set('latitude', locData.latitude.toString());
                params.set('longitude', locData.longitude.toString());
                params.set('radiusKm', DEFAULT_RADIUS_KM); // Default radius
            }
        }

        params.delete('page'); // Reset pagination on new search
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-2">
        <form
            onSubmit={handleSearch}
            className="grid grid-cols-[1fr_auto] items-center gap-0 w-full bg-background/80 backdrop-blur-lg border rounded-full shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-transparent transition-all duration-300 overflow-hidden"
        >
            <div className="flex items-center">
                {/* Search Input */}
                <div className="relative flex-grow flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-muted-foreground"/>
                    <Input
                        placeholder="Search by event, artist, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-16 w-full pl-12 pr-4 bg-transparent border-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <Separator orientation="vertical" className="h-8"/>

                {/* Location Select */}
                <div className="flex items-center pl-2 pr-4">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground"/>
                    <Select value={location} onValueChange={handleLocationChange}>
                        <SelectTrigger className="w-auto bg-transparent border-0 text-base focus:ring-0 focus:ring-offset-0 min-w-28">
                            {location === 'nearby' ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    <span>Near me</span>
                                </div>
                            ) : (
                                <SelectValue placeholder="Location"/>
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                value="nearby"
                                className="font-semibold text-primary data-[state=checked]:text-primary/90 data-[highlighted]:bg-primary/10"
                            >
                                <span className="flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                                        Near me
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        Use my current location
                                    </span>
                                </span>
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value="all">All of Sri Lanka</SelectItem>
                            {sriLankaLocations.map(loc => (
                                <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Search Button */}
            <Button
                type="submit"
                size="lg"
                className="h-12 w-12 rounded-full m-2"
                disabled={isFetchingLocation}
            >
                <Search className="h-5 w-5"/>
                <span className="sr-only">Search</span>
            </Button>
        </form>
        {locationError && (
            <p className="text-sm text-destructive">{locationError}</p>
        )}
        {location === 'nearby' && isFetchingLocation && (
            <p className="text-sm text-muted-foreground">Fetching your location…</p>
        )}
        </div>
    );
}
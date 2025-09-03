'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import React, {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {sriLankaLocations} from '../../_utils/locations';
import {Search, MapPin} from 'lucide-react';

// The component is now much simpler, with no props needed.
export function EventFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Use local state to handle input values before searching
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [location, setLocation] = useState(searchParams.get('location') || 'all');

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
        } else {
            const locData = sriLankaLocations.find(l => l.name === location);
            if (locData) {
                params.set('location', locData.name);
                params.set('latitude', locData.latitude.toString());
                params.set('longitude', locData.longitude.toString());
                params.set('radiusKm', '50'); // Default radius
            }
        }

        params.delete('page'); // Reset pagination on new search
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <form
            onSubmit={handleSearch}
            className="grid grid-cols-[1fr_auto] items-center gap-0 w-full bg-background/80 backdrop-blur-lg border rounded-full shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-transparent transition-all duration-300"
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
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-auto bg-transparent border-0 text-base focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Location"/>
                        </SelectTrigger>
                        <SelectContent>
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
            >
                <Search className="h-5 w-5"/>
                <span className="sr-only">Search</span>
            </Button>
        </form>
    );
}
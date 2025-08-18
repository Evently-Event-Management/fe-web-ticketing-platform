'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import {useCallback} from 'react';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {CategoryResponseWithParentName} from '@/types/category';
import {sriLankaLocations} from './locations';
import {Search, MapPin, Tag, X} from 'lucide-react';

interface EventFiltersProps {
    categories: CategoryResponseWithParentName[];
}

export function EventFilters({categories}: EventFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            // Reset page to 0 whenever a filter changes
            params.delete('page');
            return params.toString();
        },
        [searchParams]
    );

    const handleSelectChange = (name: string) => (value: string) => {
        // FIX: If the selected value is 'all', treat it as an empty string to clear the filter.
        const finalValue = value === 'all' ? '' : value;
        router.push(pathname + '?' + createQueryString(name, finalValue));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        router.push(pathname + '?' + createQueryString(event.target.name, event.target.value));
    };

    const clearFilters = () => {
        router.push(pathname);
    };

    const hasActiveFilters = searchParams.size > 0;

    return (
        <aside className="p-6 bg-muted/50 rounded-lg space-y-6 sticky top-24">
            <h3 className="text-xl font-semibold">Filter Events</h3>

            <div className="space-y-2">
                <label className="text-sm font-medium">Search by name</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Event title or keyword..."
                        name="searchTerm"
                        defaultValue={searchParams.get('searchTerm') || ''}
                        onChange={handleInputChange}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                    value={searchParams.get('categoryId') || ''}
                    onValueChange={handleSelectChange('categoryId')}
                >
                    <SelectTrigger className="w-full">
                        <Tag className="mr-2 h-4 w-4 text-muted-foreground"/>
                        <SelectValue placeholder="All Categories"/>
                    </SelectTrigger>
                    <SelectContent>
                        {/* FIX: Changed value from "" to "all" to prevent the error. */}
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                    value={searchParams.get('location') || ''}
                    onValueChange={(value) => {
                        const params = new URLSearchParams(searchParams.toString());
                        // FIX: Check for the 'all' value to clear location filters.
                        if (value === 'all') {
                            params.delete('location');
                            params.delete('latitude');
                            params.delete('longitude');
                            params.delete('radiusKm');
                        } else {
                            const location = sriLankaLocations.find(l => l.name === value);
                            if (location) {
                                params.set('location', location.name);
                                params.set('latitude', location.latitude.toString());
                                params.set('longitude', location.longitude.toString());
                                params.set('radiusKm', '50');
                            }
                        }
                        // Reset page to 0 when location changes
                        params.delete('page');
                        router.push(pathname + '?' + params.toString());
                    }}
                >
                    <SelectTrigger className="w-full">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground"/>
                        <SelectValue placeholder="Anywhere in Sri Lanka"/>
                    </SelectTrigger>
                    <SelectContent>
                        {/* FIX: Changed value from "" to "all" to prevent the error. */}
                        <SelectItem value="all">Anywhere in Sri Lanka</SelectItem>
                        {sriLankaLocations.map(loc => (
                            <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <Button variant="ghost" className="w-full" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4"/>
                    Clear All Filters
                </Button>
            )}

        </aside>
    );
}
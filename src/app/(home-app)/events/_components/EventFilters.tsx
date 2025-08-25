'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import {useCallback} from 'react';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {CategoryResponseWithParentName} from '@/types/category';
import {sriLankaLocations} from '../../_utils/locations';
import {Search, MapPin, Tag, X} from 'lucide-react';

interface EventFiltersProps {
    categories: CategoryResponseWithParentName[];
    inHero?: boolean;
}

export function EventFilters({categories, inHero = false}: EventFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(name, value);
            else params.delete(name);

            params.delete('page'); // reset pagination
            return params.toString();
        },
        [searchParams]
    );

    const handleSelectChange = (name: string) => (value: string) => {
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

    /* ---------------- Hero Layout ---------------- */
    if (inHero) {
        return (
            <Card className="bg-card/70 dark:bg-card/80 backdrop-blur-md border shadow-xl rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="searchTerm">Search by name</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary"/>
                            <Input
                                id="searchTerm"
                                placeholder="Event title or keyword..."
                                name="searchTerm"
                                defaultValue={searchParams.get('searchTerm') || ''}
                                onChange={handleInputChange}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={searchParams.get('categoryId') || 'all'}
                            onValueChange={handleSelectChange('categoryId')}
                        >
                            <SelectTrigger className="w-full">
                                <Tag className="mr-2 h-4 w-4 text-primary"/>
                                <SelectValue placeholder="All Categories"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={searchParams.get('location') || 'all'}
                            onValueChange={(value) => {
                                const params = new URLSearchParams(searchParams.toString());
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
                                params.delete('page');
                                router.push(pathname + '?' + params.toString());
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <MapPin className="mr-2 h-4 w-4 text-primary"/>
                                <SelectValue placeholder="Anywhere in Sri Lanka"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Anywhere in Sri Lanka</SelectItem>
                                {sriLankaLocations.map(loc => (
                                    <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-6 text-right">
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            <X className="mr-2 h-4 w-4"/>
                            Clear All
                        </Button>
                    </div>
                )}
            </Card>
        );
    }

    /* ---------------- Sidebar Layout ---------------- */
    return (
        <aside className="p-6 bg-muted/50 rounded-2xl space-y-6 sticky top-24">
            <h3 className="text-xl font-semibold">Filter Events</h3>

            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="searchTerm">Search by name</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary"/>
                    <Input
                        id="searchTerm"
                        placeholder="Event title or keyword..."
                        name="searchTerm"
                        defaultValue={searchParams.get('searchTerm') || ''}
                        onChange={handleInputChange}
                        className="pl-9"
                    />
                </div>
            </div>

            <Separator/>

            {/* Category */}
            <div className="space-y-2">
                <Label>Category</Label>
                <Select
                    value={searchParams.get('categoryId') || 'all'}
                    onValueChange={handleSelectChange('categoryId')}
                >
                    <SelectTrigger className="w-full">
                        <Tag className="mr-2 h-4 w-4 text-primary"/>
                        <SelectValue placeholder="All Categories"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator/>

            {/* Location */}
            <div className="space-y-2">
                <Label>Location</Label>
                <Select
                    value={searchParams.get('location') || 'all'}
                    onValueChange={(value) => {
                        const params = new URLSearchParams(searchParams.toString());
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
                        params.delete('page');
                        router.push(pathname + '?' + params.toString());
                    }}
                >
                    <SelectTrigger className="w-full">
                        <MapPin className="mr-2 h-4 w-4 text-primary"/>
                        <SelectValue placeholder="Anywhere in Sri Lanka"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Anywhere in Sri Lanka</SelectItem>
                        {sriLankaLocations.map(loc => (
                            <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <div className="pt-2">
                    <Button variant="ghost" className="w-full" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4"/>
                        Clear All Filters
                    </Button>
                </div>
            )}
        </aside>
    );
}
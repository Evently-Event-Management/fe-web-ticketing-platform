'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Ban} from 'lucide-react';
import {Tier} from "@/lib/validators/event";

interface TierPaletteProps {
    tiers: Tier[];
    selectedTierId: string | null;
    onSelectTier: (id: string | null) => void;
}

export function TierPalette({tiers, selectedTierId, onSelectTier}: TierPaletteProps) {
    return (
        <aside className="w-64 border-l bg-background p-4 flex flex-col">
            <CardHeader className="p-2">
                <CardTitle>Tiers</CardTitle>
                <CardDescription>Select a tier to assign it to seats or blocks on the canvas.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 flex-grow space-y-2">
                {tiers.map(tier => (
                    <Button
                        key={tier.id}
                        variant={selectedTierId === tier.id ? 'default' : 'outline'}
                        className="w-full justify-start gap-2"
                        onClick={() => onSelectTier(tier.id)}
                    >
                        <span className="h-4 w-4 rounded-full" style={{backgroundColor: tier.color || '#ccc'}}/>
                        <span className="flex-1 text-left">{tier.name}</span>
                        <span>${tier.price}</span>
                    </Button>
                ))}
                <hr className="my-4"/>
                <Button
                    variant={selectedTierId === 'RESERVED' ? 'secondary' : 'outline'}
                    className="w-full justify-start gap-2"
                    onClick={() => onSelectTier('RESERVED')}
                >
                    <Ban className="h-4 w-4"/>
                    Reserve Seats
                </Button>
            </CardContent>
        </aside>
    );
}

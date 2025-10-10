'use client';

import * as React from 'react';
import {Card, CardContent, CardTitle} from '@/components/ui/card';
import {TierFormData} from '@/lib/validators/event';

interface ReviewTicketTiersProps {
    tiers: TierFormData[];
}

export const ReviewTicketTiers: React.FC<ReviewTicketTiersProps> = ({tiers}) => {
    if (tiers.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Ticket Options</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {tiers.map(tier => (
                    <TicketTierCard key={tier.id} tier={tier}/>
                ))}
            </div>
        </div>
    );
};

interface TicketTierCardProps {
    tier: TierFormData;
}

export const TicketTierCard: React.FC<TicketTierCardProps> = ({tier}) => {
    return (
        <Card className="overflow-hidden">
            <div
                className="h-2"
                style={{backgroundColor: tier.color || '#6b7280'}}
            />
            <CardContent className="p-6">
                <CardTitle className="mb-2">{tier.name}</CardTitle>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold">LKR {tier.price.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
};

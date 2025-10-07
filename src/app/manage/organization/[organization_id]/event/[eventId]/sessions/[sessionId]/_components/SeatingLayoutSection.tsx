'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionSeatingLayout } from './SessionSeatingLayout';
import { SeatingCapacitySummary } from './seatingCapacitySummary';

interface SeatingLayoutSectionProps {
    session: any; // Use the appropriate type here
    tiers: any[]; // Use the appropriate type here
    canEditLayout: boolean;
    onEditLayout: () => void;
}

export const SeatingLayoutSection: React.FC<SeatingLayoutSectionProps> = ({
    session,
    tiers,
    canEditLayout,
    onEditLayout
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Seating Layout</CardTitle>
                {canEditLayout && (
                    <Button
                        onClick={onEditLayout}
                        variant="outline"
                        size="sm"
                    >
                        Edit Layout
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <SessionSeatingLayout
                    session={session}
                    tiers={tiers}
                />
            </CardContent>
        </Card>
    );
};
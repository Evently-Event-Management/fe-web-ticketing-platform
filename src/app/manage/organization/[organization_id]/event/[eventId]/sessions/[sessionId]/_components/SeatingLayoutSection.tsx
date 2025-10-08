'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionSeatingLayout } from './SessionSeatingLayout';
import { SeatingCapacitySummary } from './seatingCapacitySummary';
import { Grid3x3, Rows, Armchair, Pencil, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// A small helper component for consistent display of information items
const InfoItem = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-sm text-muted-foreground">{children}</span>
        </div>
    </div>
);

interface SeatingLayoutSectionProps {
    session: any; // Use the appropriate type here
    tiers: any[]; // Use the appropriate type here
    canEditLayout: boolean;
}

export const SeatingLayoutSection: React.FC<SeatingLayoutSectionProps> = ({
    session,
    tiers,
    canEditLayout
}) => {
    const params = useParams();
    const organizationId = params.organization_id as string;
    const eventId = params.eventId as string;
    const sessionId = params.sessionId as string;
    const editLayoutUrl = `/manage/organization/${organizationId}/event/${eventId}/sessions/${sessionId}/edit-layout`;
    
    // Get total capacity if available
    const totalCapacity = tiers?.reduce((acc, tier) => acc + (tier.capacity || 0), 0) || 0;
    const tierCount = tiers?.length || 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                <div className="flex items-center gap-3">
                    <Grid3x3 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Seating Layout</CardTitle>
                </div>
                {canEditLayout && (
                    <Link href={editLayoutUrl}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Edit Layout</span>
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">VISUAL LAYOUT</h3>
                        <SessionSeatingLayout
                            session={session}
                            tiers={tiers}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
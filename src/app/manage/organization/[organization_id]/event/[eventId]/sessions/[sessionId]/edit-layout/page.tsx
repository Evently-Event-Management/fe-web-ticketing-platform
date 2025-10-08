'use client'

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';
import { useEventContext } from "@/providers/EventProvider";
import { toast } from "sonner";
import { SessionType } from '@/types/enums/sessionType';
import { PhysicalLayoutEditor } from '../_components/PhysicalLayoutEditor';
import { OnlineLayoutEditor } from '../_components/OnlineLayoutEditor';
import { SessionSeatingMapRequest } from '@/lib/validators/event';
import { updateSessionLayout, SessionLayoutUpdateRequest } from '@/lib/actions/sessionActions';
import Link from 'next/link';

export default function EditLayoutPage() {
    const params = useParams();
    const router = useRouter();
    const { event, refetchSession } = useEventContext();
    
    const [isSaving, setIsSaving] = useState(false);
    
    const sessionId = params.sessionId as string;
    const organizationId = params.organization_id as string;
    const eventId = params.eventId as string;
    const returnUrl = `/manage/organization/${organizationId}/event/${eventId}/sessions/${sessionId}`;
    
    if (!event) {
        return (
            <div className="p-8 text-center w-full">
                Event Not Found
            </div>
        );
    }

    const session = event.sessions.find(s => s.id === sessionId);

    if (!session) {
        return (
            <div className="p-8 text-center w-full">
                Session Not Found
            </div>
        );
    }
    
    const { layoutData, sessionType } = session;
    
    const handleSave = async (layout: SessionSeatingMapRequest) => {
        try {
            setIsSaving(true);
            const updateData: SessionLayoutUpdateRequest = { layoutData: layout };
            await updateSessionLayout(sessionId, updateData);
            toast.success('Seating layout updated successfully');
            await refetchSession(sessionId);
            router.push(returnUrl);
        } catch (error) {
            console.error('Error updating seating layout:', error);
            toast.error('Failed to update seating layout');
            setIsSaving(false);
        }
    };

    return (
        <div className="container max-w-7xl mx-auto p-6">
            {/* Header with back button */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <Link href={returnUrl} passHref>
                        <Button variant="ghost" className="gap-2 pl-0">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Session</span>
                        </Button>
                    </Link>
                    
                    <h1 className="text-2xl font-bold">Edit Seating Layout</h1>
                </div>
                
                <p className="text-muted-foreground mb-8">
                    Configure the seating layout for this session. Changes will be saved when you confirm your layout.
                </p>
            </div>
            
            {/* Main content */}
            <div className="bg-card rounded-lg border p-6">
                <div className="min-h-[600px]">
                    {sessionType === SessionType.PHYSICAL ? (
                        <PhysicalLayoutEditor
                            onSave={handleSave}
                            initialConfig={layoutData}
                            tiers={event.tiers}
                            organizationId={organizationId}
                        />
                    ) : (
                        <OnlineLayoutEditor
                            onSave={handleSave}
                            initialConfig={layoutData}
                            tiers={event.tiers}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
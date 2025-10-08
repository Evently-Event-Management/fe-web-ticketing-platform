'use client'

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SessionType } from '@/types/enums/sessionType';
import { PhysicalLayoutEditor } from './PhysicalLayoutEditor';
import { OnlineLayoutEditor } from './OnlineLayoutEditor';
import { SessionSeatingMapRequest, TierDTO } from '@/lib/validators/event';
import { SessionLayoutUpdateRequest } from '@/lib/actions/sessionActions';

interface EditLayoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialLayout?: SessionSeatingMapRequest;
    sessionType: SessionType;
    tiers: TierDTO[];
    organizationId: string;
    onSave: (data: SessionLayoutUpdateRequest) => void;
}

export function EditLayoutDialog({
    open,
    onOpenChange,
    initialLayout,
    sessionType,
    tiers,
    organizationId,
    onSave
}: EditLayoutDialogProps) {
    // Direct save function that will be passed to the editors
    const handleDirectSave = (layout: SessionSeatingMapRequest) => {
        onSave({ layoutData: layout });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl p-0 max-h-[90vh] overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle>Edit Seating Layout</DialogTitle>
                </DialogHeader>
                
                <div className="overflow-y-auto p-6 h-[500px]">
                    {sessionType === SessionType.PHYSICAL ? (
                        <PhysicalLayoutEditor
                            onSave={handleDirectSave}
                            initialConfig={initialLayout}
                            tiers={tiers}
                            organizationId={organizationId}
                        />
                    ) : (
                        <OnlineLayoutEditor
                            onSave={handleDirectSave}
                            initialConfig={initialLayout}
                            tiers={tiers}
                        />
                    )}
                </div>
                
                <DialogFooter className="p-4 border-t bg-muted/40">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
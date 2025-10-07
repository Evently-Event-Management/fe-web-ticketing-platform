'use client'

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SessionStatusUpdateRequest } from '@/lib/actions/sessionActions';

interface ChangeStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string;
    onSave: (data: SessionStatusUpdateRequest) => void;
}

export function ChangeStatusDialog({
    open,
    onOpenChange,
    currentStatus,
    onSave
}: ChangeStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
    
    // Define allowed transitions based on current status
    const allowedTransitions = React.useMemo(() => {
        switch (currentStatus) {
            case SessionStatus.SCHEDULED:
                return [SessionStatus.ON_SALE, SessionStatus.CANCELED];
            case SessionStatus.ON_SALE:
                return [SessionStatus.CLOSED];
            default:
                return [];
        }
    }, [currentStatus]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedStatus && selectedStatus !== currentStatus) {
            onSave({ status: selectedStatus as SessionStatus });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Session Status</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Session Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                            disabled={allowedTransitions.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedTransitions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {allowedTransitions.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Status cannot be changed in the current state
                            </p>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={selectedStatus === currentStatus || allowedTransitions.length === 0}
                        >
                            Update Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
'use client'

import * as React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { formatToDateTimeLocalString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { parseISO } from 'date-fns';
import { SessionTimeUpdateRequest } from '@/lib/actions/sessionActions';

interface EditTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: {
        startTime: string;
        endTime: string;
        salesStartTime?: string;
        status: string;
    };
    onSave: (data: SessionTimeUpdateRequest) => void;
}

export function EditTimeDialog({
    open,
    onOpenChange,
    initialData,
    onSave
}: EditTimeDialogProps) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [salesStartTime, setSalesStartTime] = useState('');
    const [errors, setErrors] = useState<{
        startTime?: string;
        endTime?: string;
        salesStartTime?: string;
        general?: string;
    }>({});

    const isOnSaleStatus = initialData.status === SessionStatus.ON_SALE;
    const now = new Date();

    useEffect(() => {
        if (open) {
            setStartTime(formatToDateTimeLocalString(initialData.startTime));
            setEndTime(formatToDateTimeLocalString(initialData.endTime));
            setSalesStartTime(formatToDateTimeLocalString(initialData.salesStartTime));
            setErrors({});
        }
    }, [open, initialData]);

    const validateForm = () => {
        const newErrors: typeof errors = {};
        
        if (!startTime) {
            newErrors.startTime = "Start time is required";
        }
        
        if (!endTime) {
            newErrors.endTime = "End time is required";
        }
        
        if (!isOnSaleStatus && !salesStartTime) {
            newErrors.salesStartTime = "Sales start time is required";
        }
        
        // Check if session has already started
        if (parseISO(initialData.startTime) < now) {
            newErrors.general = "Cannot edit time for a session that has already started";
        }

        // Check date relationships
        if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
            newErrors.endTime = "End time must be after start time";
        }
        
        if (!isOnSaleStatus && startTime && salesStartTime && new Date(salesStartTime) >= new Date(startTime)) {
            newErrors.salesStartTime = "Sales start time must be before session start time";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const updateData: SessionTimeUpdateRequest = {
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            salesStartTime: salesStartTime 
                ? new Date(salesStartTime).toISOString() 
                : initialData.salesStartTime || ''
        };

        onSave(updateData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Session Time</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {errors.general}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                            id="start-time"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        {errors.startTime && <p className="text-xs text-destructive">{errors.startTime}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                            id="end-time"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                        {errors.endTime && <p className="text-xs text-destructive">{errors.endTime}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="sales-start-time">
                            Sales Start Time {isOnSaleStatus && "(cannot be changed in ON_SALE status)"}
                        </Label>
                        <Input
                            id="sales-start-time"
                            type="datetime-local"
                            value={salesStartTime}
                            onChange={(e) => setSalesStartTime(e.target.value)}
                            disabled={isOnSaleStatus}
                        />
                        {errors.salesStartTime && <p className="text-xs text-destructive">{errors.salesStartTime}</p>}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
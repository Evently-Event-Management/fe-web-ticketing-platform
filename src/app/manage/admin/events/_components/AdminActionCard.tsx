'use client';

import * as React from 'react';
import {useState} from 'react';
import {toast} from 'sonner';
import {approveEvent_Admin, rejectEvent_Admin} from '@/lib/actions/eventActions';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Check, Ban, Clock} from 'lucide-react';
import {Badge} from '@/components/ui/badge';

interface AdminActionCardProps {
    eventId: string;
    status: string;  // Added status prop
    rejectionReason?: string | null; // Optional, if available for rejected events
    onActionComplete: () => void;
}

export function AdminActionCard({eventId, status, rejectionReason = '', onActionComplete}: AdminActionCardProps) {
    const [localRejectionReason, setLocalRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        setIsSubmitting(true);
        toast.promise(approveEvent_Admin(eventId), {
            loading: 'Approving event...',
            success: () => {
                onActionComplete();
                return 'Event approved successfully!';
            },
            error: (err) => {
                console.error("Approval error:", err);
                setIsSubmitting(false);
                return err.message || 'Failed to approve event.';
            },
        });
    };

    const handleReject = async () => {
        if (!localRejectionReason.trim()) {
            toast.error("A reason is required to reject an event.");
            return;
        }
        setIsSubmitting(true);
        toast.promise(rejectEvent_Admin(eventId, localRejectionReason), {
            loading: 'Rejecting event...',
            success: () => {
                onActionComplete();
                return 'Event rejected successfully.';
            },
            error: (err) => {
                setIsSubmitting(false);
                return err.message || 'Failed to reject event.';
            },
        });
    };

    // Show different UI based on status
    if (status === 'APPROVED') {
        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Event Status</CardTitle>
                        <Badge
                            className="flex gap-1 items-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <Check size={14}/> Approved
                        </Badge>
                    </div>
                    <CardDescription>This event has been approved and is now live.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-start items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <Check size={24} className="text-green-600 dark:text-green-300"/>
                    </div>
                    <p className="text-sm">This event has passed all requirements and is visible to the public.</p>
                </CardContent>
            </Card>
        );
    }

    if (status === 'REJECTED') {
        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Event Status</CardTitle>
                        <Badge variant="destructive" className="flex gap-1 items-center">
                            <Ban size={14}/> Rejected
                        </Badge>
                    </div>
                    <CardDescription>This event was rejected and cannot go live.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                            <Ban size={24} className="text-red-600 dark:text-red-300"/>
                        </div>
                        <p className="text-sm">This event does not meet our platform requirements.</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">Rejection Reason:</h4>
                        <p className="text-sm p-3 bg-background rounded-md border">{rejectionReason || 'No specific reason provided.'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default - Pending status
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Admin Actions</CardTitle>
                    <Badge variant="outline" className="flex gap-1 items-center">
                        <Clock size={14}/> Pending Review
                    </Badge>
                </div>
                <CardDescription>Review the event and take action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason (if applicable)</Label>
                    <Textarea
                        id="rejectionReason"
                        placeholder="Provide a clear reason for rejection..."
                        value={localRejectionReason}
                        onChange={(e) => setLocalRejectionReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReject}
                        disabled={!localRejectionReason || isSubmitting}
                    >
                        Reject
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                    >
                        Approve
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

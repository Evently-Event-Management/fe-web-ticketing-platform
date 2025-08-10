'use client';

import * as React from 'react';
import {useState} from 'react';
import {toast} from 'sonner';
import {approveEvent_Admin, rejectEvent_Admin} from '@/lib/actions/eventActions';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';

interface AdminActionCardProps {
    eventId: string;
    onActionComplete: () => void; // Callback to refresh the page data
}

export function AdminActionCard({eventId, onActionComplete}: AdminActionCardProps) {
    const [rejectionReason, setRejectionReason] = useState('');
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
        if (!rejectionReason.trim()) {
            toast.error("A reason is required to reject an event.");
            return;
        }
        setIsSubmitting(true);
        toast.promise(rejectEvent_Admin(eventId, rejectionReason), {
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Review the event and take action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Rejection Reason (if applicable)</Label>
                    <Textarea
                        id="rejectionReason"
                        placeholder="Provide a clear reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReject}
                        disabled={!rejectionReason || isSubmitting}
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

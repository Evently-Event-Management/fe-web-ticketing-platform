'use client';

import * as React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {CheckCircle, Clock, AlertCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {EventStatus} from "@/lib/validators/event";

interface StatusStepProps {
    title: string;
    isActive: boolean;
    isCompleted: boolean;
    icon: React.ElementType;
}

const StatusStep = ({title, isActive, isCompleted, icon: Icon}: StatusStepProps) => (
    <div className="flex flex-col items-center text-center">
        <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background transition-all",
            isActive && "border-primary",
            isCompleted && "border-green-500 bg-green-500 text-white"
        )}>
            <Icon className={cn("h-6 w-6", isActive && "text-primary", isCompleted && "text-white")}/>
        </div>
        <p className={cn("mt-2 font-medium", isActive && "text-primary")}>{title}</p>
    </div>
);

interface EventStatusTrackerProps {
    status: EventStatus;
    rejectionReason?: string | null;
}

export function EventStatusTracker({status, rejectionReason}: EventStatusTrackerProps) {
    const isPending = status === 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';

    if (isRejected) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Event Rejected</AlertTitle>
                <AlertDescription>
                    {rejectionReason || "This event was rejected by an administrator and is not visible to the public."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around items-start">
                    <StatusStep title="Pending Review" isActive={isPending} isCompleted={isApproved} icon={Clock}/>
                    <div className="flex-1 border-t-2 mt-6 mx-4"/>
                    <StatusStep title="Approved" isActive={isApproved} isCompleted={isApproved} icon={CheckCircle}/>
                    <div className="flex-1 border-t-2 mt-6 mx-4"/>
                    <StatusStep title="Live on Site" isActive={false} isCompleted={isApproved} icon={CheckCircle}/>
                </div>
            </CardContent>
        </Card>
    );
}

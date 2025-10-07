'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { getSalesWindowDuration, getSalesStartTimeDisplay } from '@/lib/utils';

interface SessionMetadataProps {
    startDate: Date;
    endDate: Date;
    salesStartDate: Date | null;
    status: string;
    statusProps: {
        variant: "default" | "destructive" | "outline" | "secondary" | null | undefined;
    };
    salesStartTime?: string;
    startTime: string;
    canEditTime: boolean;
    canChangeStatus: boolean;
    onEditTime: () => void;
    onChangeStatus: () => void;
    getDuration: () => string;
}

export const SessionMetadata: React.FC<SessionMetadataProps> = ({
    startDate,
    endDate,
    salesStartDate,
    status,
    statusProps,
    salesStartTime,
    startTime,
    canEditTime,
    canChangeStatus,
    onEditTime,
    onChangeStatus,
    getDuration
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Session Details</CardTitle>
                {canEditTime && (
                    <Button 
                        onClick={onEditTime}
                        variant="outline"
                        size="sm"
                    >
                        Edit Times
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Start Time</div>
                        <div>{format(startDate, 'EEEE, MMMM d, yyyy h:mm a')}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">End Time</div>
                        <div>{format(endDate, 'EEEE, MMMM d, yyyy h:mm a')}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div>{getDuration()}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Sales Start</div>
                        <div>{salesStartDate ? format(salesStartDate, 'MMM d, yyyy h:mm a') : 'Not set'}</div>
                    </div>
                    {salesStartDate && salesStartTime && (
                        <div className="space-y-2 col-span-full">
                            <div className="text-sm text-muted-foreground">Sales Window</div>
                            <div>{getSalesWindowDuration(salesStartTime, startTime)}</div>
                        </div>
                    )}
                </div>
                
                {(canChangeStatus || status !== SessionStatus.CANCELED) && (
                    <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="text-sm font-medium mb-1">Session Status</div>
                            <div className="flex items-center gap-2">
                                <Badge variant={statusProps.variant}>
                                    {status?.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {status === SessionStatus.SCHEDULED && salesStartDate && 
                                        getSalesStartTimeDisplay(salesStartTime)}
                                </span>
                            </div>
                        </div>
                        {canChangeStatus && (
                            <Button
                                onClick={onChangeStatus}
                                variant="outline"
                                size="sm"
                            >
                                Change Status
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
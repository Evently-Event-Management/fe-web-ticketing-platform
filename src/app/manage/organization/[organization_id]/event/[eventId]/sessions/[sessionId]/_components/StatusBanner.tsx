'use client'

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SessionStatus } from '@/types/enums/sessionStatus';
import { format } from 'date-fns';

interface StatusBannerProps {
    status: string;
    statusProps: {
        variant: "default" | "destructive" | "outline" | "secondary" | null | undefined;
        color: string;
        icon: React.ElementType;
    };
    salesStartDate: Date | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
    status,
    statusProps,
    salesStartDate
}) => {
    return (
        <div className={`w-full p-3 mb-4 rounded-md flex items-center gap-3 bg-muted/30 border ${status === SessionStatus.CANCELED ? 'border-destructive' : ''}`}>
            <div className={`p-2 rounded-full ${statusProps.color} bg-muted`}>
                {React.createElement(statusProps.icon, { className: "h-5 w-5" })}
            </div>
            <div className="flex-1">
                <h3 className="font-medium flex items-center gap-2">
                    Session Status:
                    <Badge variant={statusProps.variant} className="text-sm">
                        {status || 'PENDING'}
                    </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                    {status === SessionStatus.PENDING && "This session is pending and can be edited."}
                    {status === SessionStatus.SCHEDULED && "This session is scheduled and some fields can still be edited."}
                    {status === SessionStatus.ON_SALE && "This session is on sale. Limited editing is available."}
                    {status === SessionStatus.SOLD_OUT && "This session is sold out. Limited editing is available."}
                    {status === SessionStatus.CLOSED && "This session is closed and can't be edited."}
                    {status === SessionStatus.CANCELED && "This session has been canceled."}
                    {status === SessionStatus.SCHEDULED && salesStartDate && (
                        <>
                            <br />
                            Sales will begin {format(salesStartDate, 'MMMM d, yyyy')} at {format(salesStartDate, 'h:mm a')}
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};
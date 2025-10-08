'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getSalesWindowDuration } from '@/lib/utils';
import { Calendar, Clock, Timer, AlarmClock, Ticket, Pencil, Tag } from 'lucide-react';

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Session Details</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={statusProps.variant} className="capitalize">
                        {status?.replace('_', ' ')}
                    </Badge>
                    {canEditTime && (
                        <Button onClick={onEditTime} variant="outline" size="sm" className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span>Edit Times</span>
                        </Button>
                    )}
                     {canChangeStatus && (
                        <Button onClick={onChangeStatus} variant="outline" size="sm" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>Change Status</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* --- Session Timing Section --- */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-semibold text-muted-foreground">SESSION TIMING</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                            <InfoItem icon={Clock} label="Starts">
                                {format(startDate, 'MMM d, yyyy ')} at {format(startDate, 'h:mm a')}
                            </InfoItem>
                            <InfoItem icon={Clock} label="Ends">
                                {format(endDate, 'MMM d, yyyy ')} at {format(endDate, 'h:mm a')}
                            </InfoItem>
                             <InfoItem icon={Timer} label="Duration">
                                {getDuration()}
                            </InfoItem>
                         </div>
                    </div>

                    {/* --- Sales Timing Section (Conditional) --- */}
                    {salesStartDate && (
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-sm font-semibold text-muted-foreground">SALES TIMING</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                                <InfoItem icon={AlarmClock} label="Sales Start">
                                    {format(salesStartDate, 'MMM d, yyyy')} at {format(salesStartDate, 'h:mm a')}
                                </InfoItem>
                                
                                {salesStartTime && (
                                    <InfoItem icon={Ticket} label="Sales Window">
                                        {getSalesWindowDuration(salesStartTime, startTime)}
                                    </InfoItem>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
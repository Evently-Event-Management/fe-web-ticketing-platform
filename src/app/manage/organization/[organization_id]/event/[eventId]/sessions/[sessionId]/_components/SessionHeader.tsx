'use client'

import React from 'react';
import { format } from 'date-fns';
import { LinkIcon, MapPin, Share2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionType } from "@/types/enums/sessionType";

interface SessionHeaderProps {
    title: string;
    startDate: Date;
    endDate: Date;
    isOnline: boolean;
    canDelete: boolean;
    onShare: () => void;
    onDelete: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
    title,
    startDate,
    endDate,
    isOnline,
    canDelete,
    onShare,
    onDelete
}) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center">
                                    {isOnline ?
                                        <LinkIcon className="h-5 w-5 text-blue-500" /> :
                                        <MapPin className="h-5 w-5 text-emerald-500" />
                                    }
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isOnline ? 'Online Session' : 'Physical Session'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                </div>
                <p className="text-muted-foreground">
                    {startDate.toDateString() === endDate.toDateString()
                        ? `Session on ${format(startDate, 'EEEE, MMMM d, yyyy')}`
                        : `Session from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`
                    }
                </p>
            </div>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={onShare}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Share Session</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
                {canDelete && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Session</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
};
'use client';

import * as React from "react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ShareComponent } from "@/components/ui/share/share-component";
import { EventThumbnailDTO } from "@/types/event";

interface EventShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: EventThumbnailDTO;
}

export function EventShareDialog({
    open,
    onOpenChange,
    event
}: EventShareDialogProps) {
    const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8090'}/events/${event.id}`;

    const handleCopy = () => {
        // Optional: handle any additional logic after copying
        onOpenChange(false); // Close dialog after copying
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Share Event</AlertDialogTitle>
                    <AlertDialogDescription>
                        Share {event.title} with others.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <ShareComponent
                        url={eventUrl}
                        title={event.title}
                        text={`Check out this event: ${event.title}`}
                        onCopy={handleCopy}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
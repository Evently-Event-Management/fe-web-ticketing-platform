import {SessionDetailDTO} from "@/lib/validators/event";
import * as React from "react";
import {useEventContext} from "@/providers/EventProvider";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {format, parseISO} from "date-fns";
import {ShareComponent} from "@/components/ui/share/share-component";

interface SessionShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: SessionDetailDTO;
}

// Session share dialog using the ShareComponent
export const SessionShareDialog: React.FC<SessionShareDialogProps> = ({
                                                                          open,
                                                                          onOpenChange,
                                                                          session
                                                                      }) => {
    const {event} = useEventContext();
    const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8090'}/events/${event?.id}`;

    const handleCopy = () => {
        // Optional: handle any additional logic after copying
        onOpenChange(false); // Close dialog after copying
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Share Session</AlertDialogTitle>
                    <AlertDialogDescription>
                        Share the session details for {format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <ShareComponent
                        url={eventUrl}
                        title={`${event?.title || 'Event'} - ${format(parseISO(session.startTime), "MMMM d, yyyy")}`}
                        text={`Check out this event: ${event?.title || 'Event'} on ${format(parseISO(session.startTime), "MMMM d, yyyy")}`}
                        onCopy={handleCopy}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
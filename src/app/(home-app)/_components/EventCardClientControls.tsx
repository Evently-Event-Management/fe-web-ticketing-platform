'use client';

import {useEffect, useState, MouseEvent} from 'react';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Bell, Loader2, Share2} from 'lucide-react';
import {toast} from 'sonner';
import {subscribeToEntity, unsubscribeFromEntity, checkSubscriptionStatus} from '@/lib/subscriptionUtils';
import {EventShareDialog} from './EventShareDialog';
import {cn} from '@/lib/utils';
import {EventThumbnailDTO} from '@/types/event';

interface EventCardClientControlsProps {
    event: EventThumbnailDTO;
}

export function EventCardClientControls({event}: EventCardClientControlsProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkStatus = async () => {
            setIsLoading(true);
            try {
                const status = await checkSubscriptionStatus(event.id, 'event');
                if (mounted) {
                    setIsSubscribed(status);
                }
            } catch (error) {
                console.error('Error checking subscription status:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void checkStatus();

        return () => {
            mounted = false;
        };
    }, [event.id]);

    const handleSubscribeClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        try {
            if (isSubscribed) {
                const success = await unsubscribeFromEntity({id: event.id, type: 'event', name: event.title});
                if (success) {
                    setIsSubscribed(false);
                    toast.success(`Unsubscribed from ${event.title}`);
                }
            } else {
                const success = await subscribeToEntity({id: event.id, type: 'event', name: event.title});
                if (success) {
                    setIsSubscribed(true);
                    toast.success(`Subscribed to ${event.title}`);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="absolute top-3 right-3 flex gap-2">
                <Button
                    size="icon"
                    variant="secondary"
                    className="bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/95 p-2 h-9 w-9 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsShareDialogOpen(true);
                    }}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                disabled={isLoading}
                                className={cn(
                                    'bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/95 p-2 h-9 w-9 rounded-full',
                                    isSubscribed && 'text-primary'
                                )}
                                onClick={handleSubscribeClick}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Bell className="w-4 h-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isLoading
                                ? 'Processing...'
                                : isSubscribed
                                    ? 'Unsubscribe from event updates'
                                    : 'Subscribe to event updates'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <EventShareDialog
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                event={event}
            />
        </>
    );
}

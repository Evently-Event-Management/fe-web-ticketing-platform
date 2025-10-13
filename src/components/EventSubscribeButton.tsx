import { useState, MouseEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { subscribeToEntity, unsubscribeFromEntity, checkSubscriptionStatus } from "@/lib/subscriptionUtils";

interface EventSubscribeButtonProps {
  eventId: string;
  eventTitle: string;
  variant?: "icon" | "default" | "outline" | "secondary";
  className?: string;
}

export function EventSubscribeButton({
  eventId,
  eventTitle,
  variant = "icon",
  className,
}: EventSubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const status = await checkSubscriptionStatus(eventId, 'event');
        setIsSubscribed(status);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [eventId]);

  const handleSubscribeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await unsubscribeFromEntity({
          id: eventId,
          type: 'event',
          name: eventTitle
        });
        
        if (success) {
          setIsSubscribed(false);
          toast.success(`Unsubscribed from ${eventTitle}`);
        }
      } else {
        // Subscribe
        const success = await subscribeToEntity({
          id: eventId,
          type: 'event',
          name: eventTitle
        });
        
        if (success) {
          setIsSubscribed(true);
          toast.success(`Subscribed to ${eventTitle}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              disabled={isLoading}
              className={cn(
                "bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/95 p-2 h-9 w-9 rounded-full",
                isSubscribed && "bg-primary/20 text-primary hover:bg-primary/30",
                className
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
              ? "Processing..." 
              : isSubscribed 
                ? "Unsubscribe from event updates" 
                : "Subscribe to event updates"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={isLoading}
      className={cn(
        isSubscribed && "bg-primary/10 border-primary text-primary hover:bg-primary/20",
        className
      )}
      onClick={handleSubscribeClick}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Bell className="w-4 h-4 mr-2" />
      )}
      {isLoading 
        ? "Processing..." 
        : isSubscribed 
          ? "Unsubscribe" 
          : "Subscribe"}
    </Button>
  );
}
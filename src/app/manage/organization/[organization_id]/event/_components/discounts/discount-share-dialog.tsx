"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SessionDTO, DiscountDTO } from "@/lib/validators/event";
import { ShareComponent } from "@/components/ui/share/share-component";
import { useEventContext } from "@/providers/EventProvider";
import { format } from "date-fns";

interface DiscountShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: DiscountDTO;
  sessions?: SessionDTO[];
}

export function DiscountShareDialog({
  open,
  onOpenChange,
  discount,
  sessions = []
}: DiscountShareDialogProps) {
  const { event } = useEventContext();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Filter sessions that are applicable to this discount
  const applicableSessions = sessions.filter(session => 
    !discount.applicableSessionIds?.length || 
    discount.applicableSessionIds.includes(session.id)
  );

  // Generate the share URL once a session is selected
  const generateShareUrl = (sessionId: string) => {
    if (!event?.id) return "";
    
    // Format: {domain}/events/{eventId}/{sessionId}?discount={discountCode}
    const baseUrl = window.location.origin;
    return `${baseUrl}/events/${event.id}/${sessionId}?discount=${discount.code}`;
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setGeneratedUrl(generateShareUrl(sessionId));
  };

  const formatSessionDate = (startTime?: string | null, endTime?: string | null) => {
    if (!startTime) return "No date";
    
    const startDate = new Date(startTime);
    const formattedStart = format(startDate, "MMM d, yyyy h:mm a");
    
    if (!endTime) return formattedStart;
    
    const endDate = new Date(endTime);
    // If same day, only show time for end
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${formattedStart} - ${format(endDate, "h:mm a")}`;
    }
    
    return `${formattedStart} - ${format(endDate, "MMM d, yyyy h:mm a")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Discount: {discount.code}</DialogTitle>
          <DialogDescription>
            Select which session you want to share this discount code for.
          </DialogDescription>
        </DialogHeader>
        
        {applicableSessions.length > 0 ? (
          <>
            <div className="py-2">
              <Label className="text-sm font-medium mb-2 block">Select Session</Label>
              <RadioGroup 
                value={selectedSessionId || ""} 
                onValueChange={handleSessionSelect}
                className="space-y-2"
              >
                {applicableSessions.map((session, index) => (
                  <div 
                    key={session.id} 
                    className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <RadioGroupItem value={session.id} id={session.id} />
                    <div className="flex flex-col">
                      <Label htmlFor={session.id} className="font-medium cursor-pointer">
                        {`Session ${index + 1}`}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {formatSessionDate(session.startTime, session.endTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {generatedUrl && (
              <div className="border rounded-lg p-4 mt-4">
                <Label className="text-sm font-medium mb-2 block">Share this link</Label>
                <ShareComponent 
                  url={generatedUrl}
                  title={`${event?.title} - ${discount.code}`}
                  text={`Use discount code ${discount.code} for ${event?.title}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">No applicable sessions found for this discount.</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

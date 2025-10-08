'use client'

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SessionStatus } from '@/types/enums/sessionStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SessionStatusUpdateRequest } from '@/lib/actions/sessionActions';
import { AlertTriangle, Calendar, Clock, Tag, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ChangeStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string;
    onSave: (data: SessionStatusUpdateRequest) => void;
}

export function ChangeStatusDialog({
    open,
    onOpenChange,
    currentStatus,
    onSave
}: ChangeStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>("");
    
    // Define status descriptions and allowed transitions based on current status
    const statusInfo = React.useMemo(() => {
        return {
            [SessionStatus.PENDING]: {
                description: "Initial state when a session is first created",
                icon: <Clock className="h-4 w-4" />,
                color: "bg-slate-100 text-slate-800"
            },
            [SessionStatus.SCHEDULED]: {
                description: "Session is scheduled but not yet on sale",
                icon: <Calendar className="h-4 w-4" />,
                color: "bg-blue-100 text-blue-800"
            },
            [SessionStatus.ON_SALE]: {
                description: "Tickets are available for purchase",
                icon: <Tag className="h-4 w-4" />,
                color: "bg-green-100 text-green-800"
            },
            [SessionStatus.SOLD_OUT]: {
                description: "All tickets have been sold",
                icon: <CheckCircle className="h-4 w-4" />,
                color: "bg-amber-100 text-amber-800"
            },
            [SessionStatus.CLOSED]: {
                description: "Session is no longer accepting ticket purchases",
                icon: <AlertTriangle className="h-4 w-4" />,
                color: "bg-orange-100 text-orange-800"
            },
            [SessionStatus.CANCELED]: {
                description: "Session has been canceled",
                icon: <AlertTriangle className="h-4 w-4" />,
                color: "bg-red-100 text-red-800"
            },
        };
    }, []);
    
    // Define allowed transitions based on current status
    const allowedTransitions = React.useMemo(() => {
        switch (currentStatus) {
            case SessionStatus.PENDING:
                return [SessionStatus.SCHEDULED];
            case SessionStatus.SCHEDULED:
                return [SessionStatus.ON_SALE, SessionStatus.CANCELED];
            case SessionStatus.ON_SALE:
                return [SessionStatus.SOLD_OUT, SessionStatus.CLOSED, SessionStatus.CANCELED];
            case SessionStatus.SOLD_OUT:
                return [SessionStatus.ON_SALE, SessionStatus.CLOSED];
            case SessionStatus.CLOSED:
                return [SessionStatus.CANCELED];
            default:
                return [];
        }
    }, [currentStatus]);
    
    // Define transition explanations
    const transitionExplanations = React.useMemo(() => {
        return {
            [SessionStatus.PENDING]: {
                [SessionStatus.SCHEDULED]: "Mark as ready with a defined date and time",
            },
            [SessionStatus.SCHEDULED]: {
                [SessionStatus.ON_SALE]: "Start selling tickets for this session",
                [SessionStatus.CANCELED]: "Cancel this scheduled session",
            },
            [SessionStatus.ON_SALE]: {
                [SessionStatus.SOLD_OUT]: "Mark as sold out (no more tickets available)",
                [SessionStatus.CLOSED]: "Close ticket sales but keep the session active",
                [SessionStatus.CANCELED]: "Cancel this session (will notify ticket holders)",
            },
            [SessionStatus.SOLD_OUT]: {
                [SessionStatus.ON_SALE]: "Release more tickets for sale",
                [SessionStatus.CLOSED]: "Close this sold out session",
            },
            [SessionStatus.CLOSED]: {
                [SessionStatus.CANCELED]: "Cancel this closed session",
            },
            [SessionStatus.CANCELED]: {
                // No transitions from CANCELED state
            }
        } as Record<SessionStatus, Record<SessionStatus, string>>;
    }, []);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedStatus && selectedStatus !== currentStatus) {
            // Open confirmation dialog instead of immediately saving
            setIsConfirmDialogOpen(true);
        }
    };
    
    const handleConfirmStatusChange = () => {
        if (confirmText === selectedStatus) {
            onSave({ status: selectedStatus as SessionStatus });
            setIsConfirmDialogOpen(false);
            setConfirmText("");
        }
    };
    
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Session Status</DialogTitle>
                        <DialogDescription>
                            Update the session status based on your event's needs
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="text-sm font-medium">Current Status:</div>
                            <Badge className={statusInfo[currentStatus as SessionStatus]?.color}>
                                <div className="flex items-center space-x-1">
                                    {statusInfo[currentStatus as SessionStatus]?.icon}
                                    <span>{currentStatus.replace('_', ' ')}</span>
                                </div>
                            </Badge>
                        </div>
                        
                        <Card className="p-4 bg-muted/50 mb-4">
                            <div className="flex items-start space-x-2">
                                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium">Status Information</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {statusInfo[currentStatus as SessionStatus]?.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-base">Change to:</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={setSelectedStatus}
                                disabled={allowedTransitions.length === 0}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a new status">
                                        <div className="flex items-center space-x-2 truncate">
                                            {selectedStatus && selectedStatus !== currentStatus && statusInfo[selectedStatus as SessionStatus]?.icon}
                                            <span className="truncate">{selectedStatus}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {allowedTransitions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    {statusInfo[status]?.icon}
                                                    <span className="font-medium">{status}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground mt-1 ml-6">
                                                    {transitionExplanations[currentStatus as SessionStatus]?.[status as SessionStatus]}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {allowedTransitions.length === 0 && (
                                <Card className="p-3 mt-2 border-amber-200 bg-amber-50">
                                    <div className="flex items-start space-x-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                                        <p className="text-sm text-amber-800">
                                            No status changes are allowed from the current <strong>{currentStatus}</strong> status.
                                        </p>
                                    </div>
                                </Card>
                            )}
                            
                            {selectedStatus !== currentStatus && (
                                <Card className={`p-3 mt-2 ${
                                    selectedStatus === SessionStatus.CANCELED ? 
                                    'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                                }`}>
                                    <div className="flex items-start space-x-2">
                                        {selectedStatus === SessionStatus.CANCELED ? (
                                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                        ) : (
                                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                selectedStatus === SessionStatus.CANCELED ? 'text-red-800' : 'text-blue-800'
                                            }`}>
                                                What happens when you change to {selectedStatus}:
                                            </p>
                                            <p className={`text-sm mt-1 ${
                                                selectedStatus === SessionStatus.CANCELED ? 'text-red-700' : 'text-blue-700'
                                            }`}>
                                                {transitionExplanations[currentStatus as SessionStatus]?.[selectedStatus as SessionStatus] || 
                                                `Change status from ${currentStatus} to ${selectedStatus}`}
                                            </p>
                                            
                                            {selectedStatus === SessionStatus.CANCELED && (
                                                <p className="text-sm mt-2 text-red-700 font-medium">
                                                    This action cannot be undone. Ticket holders will be notified of cancellation.
                                                </p>
                                            )}
                                            
                                            {selectedStatus === SessionStatus.ON_SALE && (
                                                <p className="text-sm mt-2 text-blue-700">
                                                    Make sure your pricing tiers and seating layout are set up correctly before putting tickets on sale.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                        
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={selectedStatus === currentStatus || allowedTransitions.length === 0}
                                className="ml-2"
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to change the session status from <strong>{currentStatus}</strong> to <strong>{selectedStatus}</strong>.
                            <br /><br />
                            {selectedStatus === SessionStatus.CANCELED ? (
                                <span className="text-red-500 font-semibold">
                                    Warning: This will cancel the session. If tickets have been sold, notifications will be sent to ticket holders.
                                </span>
                            ) : (
                                transitionExplanations[currentStatus as SessionStatus]?.[selectedStatus as SessionStatus]
                            )}
                            <br /><br />
                            To confirm, please type <strong>{selectedStatus}</strong> below:
                        </AlertDialogDescription>
                        <div className="mt-2">
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type status here to confirm"
                                className="w-full"
                            />
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setIsConfirmDialogOpen(false);
                            setConfirmText("");
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmStatusChange}
                            disabled={confirmText !== selectedStatus}
                            className={selectedStatus === SessionStatus.CANCELED ? 
                                "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            Confirm Change
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {SelectedSeat} from '@/app/(home-app)/events/[event_id]/[session_id]/_components/SessionBooking';
import {ScrollArea} from '@/components/ui/scroll-area';
import {CreditCard, Info, ShieldAlert, Ticket} from 'lucide-react';
import {createOrder} from '@/lib/actions/orderActions';
import {useState} from 'react';
import {Loader2} from 'lucide-react';
import {toast} from "sonner";

interface OrderConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSeats: SelectedSeat[];
    eventId: string;
    sessionId: string;
    onSuccess: (orderId: string) => void;
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             selectedSeats,
                                                                             eventId,
                                                                             sessionId,
                                                                             onSuccess
                                                                         }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.tier.price, 0);
    const formattedTotal = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0
    }).format(totalAmount);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const response = await createOrder({
                eventID: eventId,
                sessionId: sessionId,
                seatIds: selectedSeats.map(seat => seat.id),
            });

            toast.success("Order created successfully!");
            onSuccess(response.orderId);
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Failed to create order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">Confirm Your Order</DialogTitle>
                    <DialogDescription>
                        Please review your ticket selection before proceeding to payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Ticket className="h-4 w-4"/>
                            Selected Tickets ({selectedSeats.length})
                        </h3>

                        <ScrollArea className="h-[200px] rounded-md border">
                            <div className="p-4 space-y-2">
                                {selectedSeats.map((seat) => (
                                    <div key={seat.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium">{seat.label}</p>
                                            <p className="text-xs text-muted-foreground">{seat.tier.name} - {seat.blockName}</p>
                                        </div>
                                        <p className="font-mono">
                                            {new Intl.NumberFormat('en-LK', {
                                                style: 'currency',
                                                currency: 'LKR',
                                                minimumFractionDigits: 0
                                            }).format(seat.tier.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4"/>
                            Order Summary
                        </h3>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formattedTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Service Fee</span>
                                <span>LKR 0</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formattedTotal}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3 text-sm flex items-start gap-2">
                        <ShieldAlert className="h-5 w-5 text-yellow-800 dark:text-yellow-400 flex-shrink-0 mt-0.5"/>
                        <div className="text-yellow-800 dark:text-yellow-400">
                            You&#39;ll have 15 minutes to complete your payment before your seats are released.
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4"/>
                                Proceed to Payment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OrderConfirmationDialog;

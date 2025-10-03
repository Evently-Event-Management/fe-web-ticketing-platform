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
import {ScrollArea} from '@/components/ui/scroll-area';
import {CreditCard, Info, ShieldAlert, Ticket, Tag} from 'lucide-react';
import {createOrder} from '@/lib/actions/orderActions';
import {useState} from 'react';
import {Loader2} from 'lucide-react';
import {toast} from "sonner";
import TicketItemView from '@/components/ui/TicketItemView';
import {DiscountDTO, SelectedSeat} from "@/types/event";
import {applyDiscount} from "@/lib/discountUtils";

interface OrderConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSeats: SelectedSeat[];
    eventId: string;
    sessionId: string;
    onSuccess: (orderId: string) => void;
    appliedDiscount: DiscountDTO | null; // This can be null if no discount is applied
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
    isOpen,
    onClose,
    selectedSeats,
    eventId,
    sessionId,
    onSuccess,
    appliedDiscount // Destructure the new prop
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UPDATED: Use the shared utility to calculate all price components
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.tier.price, 0);
    const {finalPrice, discountAmount} = applyDiscount(subtotal, appliedDiscount, selectedSeats);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const t = toast.loading("Creating your order...");
        try {
            const response = await createOrder({
                event_id: eventId,
                session_id: sessionId,
                seat_ids: selectedSeats.map(seat => seat.id),
                discount_id: appliedDiscount?.id ?? null,
            });

            if (response?.order_id) {
                toast.success("Order created successfully!", { id: t });
                onSuccess(response.order_id);
            } else {
                throw new Error("Order creation did not return an order ID.");
            }

        } catch (error: unknown) {
            console.error("Error creating order:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error("Failed to create order", { description: errorMessage, id: t });

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
                                    <TicketItemView
                                        key={seat.id}
                                        seat={seat}
                                        variant="list"
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4"/>
                            Order Summary
                        </h3>

                        {/* UPDATED: Price breakdown with discount */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="h-4 w-4"/>
                                        Discount ({appliedDiscount.code})
                                    </span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Service Fee</span>
                                <span>{formatCurrency(0)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>{formatCurrency(finalPrice)}</span>
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

"use client";

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ShoppingCart, Armchair, Tag, XCircle, AlertCircle} from 'lucide-react';
import {SelectedSeat, DiscountDTO} from "@/types/event";
import {useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import TicketItemView from '@/components/ui/TicketItemView';
import {applyDiscount} from "@/lib/discountUtils";
import OrderConfirmationDialog from '@/components/ui/OrderConfirmationDialog';
import {DiscountDialog} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/DiscountDialog";

export const SelectionSummary = ({selectedSeats, onSeatRemove, publicDiscounts}: {
    selectedSeats: SelectedSeat[],
    onSeatRemove: (seatId: string) => void,
    publicDiscounts: DiscountDTO[]
}) => {
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountDTO | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const eventId = params.event_id as string;
    const sessionId = params.session_id as string;

    const subtotal = selectedSeats.reduce((total, seat) => total + seat.tier.price, 0);
    const {finalPrice, discountAmount, error} = applyDiscount(subtotal, appliedDiscount, selectedSeats);

    // Check discount validity whenever cart changes
    useEffect(() => {
        if (appliedDiscount) {
            const {error} = applyDiscount(subtotal, appliedDiscount, selectedSeats);
            if (error) {
                setDiscountError(error);
            } else {
                setDiscountError(null);
            }
        }
    }, [selectedSeats, subtotal, appliedDiscount]);

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountError(null);
        toast.info("Discount removed.");
    };

    const handleApplyDiscount = (discount: DiscountDTO) => {
        // Check if discount can be applied
        const {error} = applyDiscount(subtotal, discount, selectedSeats);
        if (error) {
            setDiscountError(error);
            toast.error(error);
        } else {
            setDiscountError(null);
            setAppliedDiscount(discount);
            toast.success(`Discount "${discount.code}" applied!`);
        }
    };

    return (
        <>
            <Card className="flex flex-col flex-grow overflow-hidden shadow-lg">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5"/>
                        Your Selection
                        <div className="text-sm font-bold bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-full">
                            {selectedSeats.length}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                    {selectedSeats.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-3">
                            <ul className="space-y-3">
                                {selectedSeats.map(seat => (
                                    <li key={seat.id}>
                                        <TicketItemView
                                            seat={seat}
                                            variant="list"
                                            showRemoveButton={true}
                                            onRemove={onSeatRemove}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                            <Armchair className="h-10 w-10 text-muted-foreground/50"/>
                            <div>
                                <p className="font-semibold">Your cart is empty</p>
                                <p>Select an available seat on the map to add it.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4 pt-4">
                    {/* Discount section */}
                    {appliedDiscount ? (
                        <div className="space-y-2">
                            <div className={`flex justify-between items-center text-sm p-2 rounded-md ${
                                discountError 
                                    ? "bg-red-50 dark:bg-red-900/20" 
                                    : "bg-green-50 dark:bg-green-900/20"
                            }`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    <Tag className={`h-4 w-4 ${
                                        discountError 
                                            ? "text-red-700 dark:text-red-400" 
                                            : "text-green-700 dark:text-green-400"
                                    }`} />
                                    <span className={discountError
                                        ? "text-red-700 dark:text-red-400"
                                        : "text-green-700 dark:text-green-400"
                                    }>
                                        Code &#34;{appliedDiscount.code}&#34; {discountError ? "Invalid" : "Applied"}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveDiscount}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            {discountError && (
                                <div className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                                    <AlertCircle className="h-3 w-3 mt-0.5" />
                                    <span>{discountError}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button variant="link" className="p-0 h-auto justify-start" onClick={() => setDiscountDialogOpen(true)}>
                            Have a discount code?
                        </Button>
                    )}

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(subtotal)}</span>
                        </div>
                        {appliedDiscount && !discountError && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>-{new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(discountAmount)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-bold tracking-tight">
                            {new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(discountError ? subtotal : finalPrice)}
                        </span>
                    </div>
                    <Button size="lg" disabled={selectedSeats.length === 0} onClick={() => setOrderDialogOpen(true)}>
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
            <DiscountDialog
                isOpen={discountDialogOpen}
                onClose={() => setDiscountDialogOpen(false)}
                onApplyDiscount={handleApplyDiscount}
                publicDiscounts={publicDiscounts}
                appliedDiscount={appliedDiscount}
                eventId={eventId}
                sessionId={sessionId}
            />
            <OrderConfirmationDialog
                isOpen={orderDialogOpen}
                onClose={() => setOrderDialogOpen(false)}
                selectedSeats={selectedSeats}
                eventId={eventId}
                sessionId={sessionId}
                appliedDiscount={discountError ? null : appliedDiscount}
                onSuccess={(orderId) => router.push(`/orders/${orderId}`)}
            />
        </>
    );
};
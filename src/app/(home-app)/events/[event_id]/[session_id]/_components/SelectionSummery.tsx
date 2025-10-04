"use client";

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ShoppingCart, Armchair, Tag, XCircle} from 'lucide-react';
import {SelectedSeat, DiscountDTO} from "@/types/event";
import {useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import TicketItemView from '@/components/ui/TicketItemView';
import {applyDiscount} from "@/lib/discountUtils";
import OrderConfirmationDialog from '@/components/ui/OrderConfirmationDialog';
import {DiscountDialog} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/DiscountDialog";
import {getDiscountByCode} from "@/lib/actions/public/eventActions";
import {Badge} from "@/components/ui/badge";

export const SelectionSummary = ({
    selectedSeats, 
    onSeatRemoveAction,
    publicDiscounts,
    initialDiscountCode = null
}: {
    selectedSeats: SelectedSeat[],
    onSeatRemoveAction: (seatId: string) => void,
    publicDiscounts: DiscountDTO[],
    initialDiscountCode?: string | null
}) => {
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountDTO | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const eventId = params.event_id as string;
    const sessionId = params.session_id as string;
    const subtotal = useMemo(
        () => selectedSeats.reduce((total, seat) => total + seat.tier.price, 0),
        [selectedSeats]
    );
    const {finalPrice, discountAmount} = applyDiscount(subtotal, appliedDiscount, selectedSeats);


    const handleApplyDiscount = useCallback((discount: DiscountDTO) => {
        const {error} = applyDiscount(subtotal, discount, selectedSeats);

        setAppliedDiscount(discount);

        if (error) {
            setDiscountError(error);
            toast.error(error);
        } else {
            setDiscountError(null);
            toast.success(`Discount "${discount.code}" applied!`);
        }
    }, [subtotal, selectedSeats]);

    useEffect(() => {
        if (!initialDiscountCode) return;

        if (initialDiscountCode) {
            const params = new URLSearchParams(window.location.search);
            params.delete('discount');
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }

        const urlDiscountCode = initialDiscountCode;

        if (!appliedDiscount && publicDiscounts.length > 0) {
            const discount = publicDiscounts.find(
                d => d.code.toUpperCase() === urlDiscountCode.toUpperCase()
            );

            if (discount) {
                handleApplyDiscount(discount);
            } else {
                (async () => {
                    try {
                        const result = await getDiscountByCode(eventId, sessionId, urlDiscountCode);
                        if (result) {
                            handleApplyDiscount(result);
                        } else {
                            console.log("Discount code in URL is not valid:", urlDiscountCode);
                        }
                    } catch (e) {
                        console.error("Error validating discount code:", e);
                    }
                })();
            }
        }
    }, [publicDiscounts, initialDiscountCode, appliedDiscount, eventId, sessionId, handleApplyDiscount]);


    // Validate applied discount when cart changes
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

    return (
        <>
            <Card className="flex flex-col flex-grow overflow-hidden shadow-lg gap-0">
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
                                            onRemove={onSeatRemoveAction}
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
                                        Code &#34;{appliedDiscount.code}&#34; {discountError ? "Not applied" : "Applied"}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveDiscount}>
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {discountError && (
                                <div className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                                    <span>{discountError}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button variant="link" className="p-0 h-auto justify-start flex items-center gap-2" onClick={() => setDiscountDialogOpen(true)}>
                            Apply a discount code?
                            {publicDiscounts && publicDiscounts.length > 0 && (
                                <Badge variant={'success'} >
                                    {publicDiscounts.length} available
                                </Badge>
                            )}
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
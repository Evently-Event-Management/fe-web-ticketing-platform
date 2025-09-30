import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ShoppingCart, Armchair} from 'lucide-react';
import {useState} from 'react';
import OrderConfirmationDialog from '@/components/ui/OrderConfirmationDialog';
import {useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import TicketItemView from '@/components/ui/TicketItemView';
import {SelectedSeat} from "@/types/event";
import { Tag, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { getDiscountByCode } from "@/lib/actions/public/eventActions"; // Assumed server action
import { DiscountDTO } from "@/types/event";
import { applyDiscount } from "@/lib/discountUtils"; // Import the new utility

export const SelectionSummary = ({ selectedSeats, onSeatRemove }: {
    selectedSeats: SelectedSeat[],
    onSeatRemove: (seatId: string) => void
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const eventId = params.event_id as string;
    const sessionId = params.session_id as string;

    // ✅ ADDED: State for discount logic
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountDTO | null>(null);
    const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);

    const subtotal = selectedSeats.reduce((total, seat) => total + seat.tier.price, 0);

    // ✅ ADDED: Calculate final price using the business logic utility
    const { finalPrice, discountAmount, error: discountError } = applyDiscount(subtotal, appliedDiscount, selectedSeats);

    const handleApplyDiscount = async () => {
        if (!discountCodeInput) return;
        setIsLoadingDiscount(true);
        setAppliedDiscount(null); // Clear previous discount if trying a new one
        try {
            const result = await getDiscountByCode(eventId, sessionId, discountCodeInput);
            if (result) {
                setAppliedDiscount(result);
                toast.success(`Discount "${result.code}" applied!`);
            } else {
                toast.error("Invalid or inapplicable discount code.");
            }
        } catch (e) {
            toast.error("Failed to apply discount.");
        } finally {
            setIsLoadingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCodeInput('');
        toast.info("Discount removed.");
    };

    return (
        <>
            <Card className="flex flex-col flex-grow overflow-hidden shadow-lg">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5"/>
                        Your Selection
                        <div
                            className="text-sm font-bold bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-full">
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
                        <div
                            className="h-[300px] flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                            <Armchair className="h-10 w-10 text-muted-foreground/50"/>
                            <div>
                                <p className="font-semibold">Your cart is empty</p>
                                <p>Select an available seat on the map to add it.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4 pt-4">
                    {/* ✅ ADDED: Discount Code Input Section */}
                    <div className="space-y-2">
                        {appliedDiscount ? (
                            <div className="flex justify-between items-center text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                                <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
                                    <Tag className="h-4 w-4"/>
                                    <span>Code "{appliedDiscount.code}" Applied</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveDiscount}>
                                    <XCircle className="h-4 w-4"/>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter discount code"
                                    value={discountCodeInput}
                                    onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                                    className="uppercase"
                                    disabled={selectedSeats.length === 0}
                                />
                                <Button onClick={handleApplyDiscount} disabled={!discountCodeInput || isLoadingDiscount || selectedSeats.length === 0}>
                                    {isLoadingDiscount ? "..." : "Apply"}
                                </Button>
                            </div>
                        )}
                        {discountError && <p className="text-xs text-destructive">{discountError}</p>}
                    </div>

                    {/* ✅ UPDATED: Price breakdown */}
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(subtotal)}</span>
                        </div>
                        {appliedDiscount && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>-{new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(discountAmount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-bold tracking-tight">
                            {new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(finalPrice)}
                        </span>
                    </div>

                    <Button size="lg" disabled={selectedSeats.length === 0} onClick={() => setDialogOpen(true)}>
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>

            <OrderConfirmationDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                selectedSeats={selectedSeats}
                eventId={eventId}
                sessionId={sessionId}
                appliedDiscount={appliedDiscount} // Pass the applied discount
                onSuccess={(orderId) => router.push(`/orders/${orderId}`)}
            />
        </>
    );
};
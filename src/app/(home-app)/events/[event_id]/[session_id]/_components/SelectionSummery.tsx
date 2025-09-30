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

export const SelectionSummary = ({selectedSeats, onSeatRemove}: {
    selectedSeats: SelectedSeat[],
    onSeatRemove: (seatId: string) => void
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const eventId = params.event_id as string;
    const sessionId = params.session_id as string;

    const totalPrice = selectedSeats.reduce((total, seat) => total + seat.tier.price, 0);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleOrderSuccess = (orderId: string) => {
        toast.success("Order created successfully!");
        setDialogOpen(false);
        router.push(`/orders/${orderId}`);
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
                <CardFooter className="flex-col items-stretch gap-3">
                    <div className="flex justify-between items-baseline">
                        <span className="text-lg font-medium text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR'}).format(totalPrice)}
                        </span>
                    </div>
                    <Button
                        size="lg"
                        disabled={selectedSeats.length === 0}
                        onClick={handleOpenDialog}
                    >
                        Proceed to Checkout
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Discount codes coming soon.
                    </span>
                </CardFooter>
            </Card>

            <OrderConfirmationDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                selectedSeats={selectedSeats}
                eventId={eventId}
                sessionId={sessionId}
                onSuccess={handleOrderSuccess}
            />
        </>
    );
};
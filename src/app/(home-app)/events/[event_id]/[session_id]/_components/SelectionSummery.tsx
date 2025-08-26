import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ShoppingCart, X, Ticket, Armchair} from 'lucide-react'; // Added Ticket and Armchair icons
import {SelectedSeat} from './SessionBooking';

export const SelectionSummary = ({selectedSeats, onSeatRemove}: {
    selectedSeats: SelectedSeat[],
    onSeatRemove: (seatId: string) => void
}) => {
    const totalPrice = selectedSeats.reduce((total, seat) => total + seat.tier.price, 0);

    console.log("Rendering SelectionSummary with seats:", selectedSeats);
    return (
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
                                <li key={seat.id}
                                    className="bg-muted/40 border rounded-lg flex overflow-hidden transition-all hover:shadow-md">
                                    {/* Left "Stub" with Ticket Icon and Tier Color */}
                                    <div className="relative flex items-center justify-center p-4"
                                         style={{backgroundColor: `${seat.tier.color}20`}}>
                                        <Ticket className="h-7 w-7" style={{color: seat.tier.color}}/>
                                    </div>

                                    {/* Dashed Separator */}
                                    <div className="border-l-2 border-dashed border-muted"/>

                                    {/* Right "Details" section */}
                                    <div className="flex-grow p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-foreground">Seat {seat.label}</p>
                                            <p className="text-sm text-muted-foreground">{seat.tier.name} - {seat.blockName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-semibold text-foreground text-sm">
                                                {new Intl.NumberFormat('en-LK', {
                                                    style: 'currency',
                                                    currency: 'LKR',
                                                    minimumFractionDigits: 0
                                                }).format(seat.tier.price)}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => onSeatRemove(seat.id)}
                                            >
                                                <X className="h-4 w-4"/>
                                                <span className="sr-only">Remove seat</span>
                                            </Button>
                                        </div>
                                    </div>
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
                <Button size="lg" disabled={selectedSeats.length === 0}>Proceed to Checkout</Button>
                <span className="text-xs text-muted-foreground">
                    Discount codes can be applied at checkout.
                </span>
            </CardFooter>
        </Card>
    );
};
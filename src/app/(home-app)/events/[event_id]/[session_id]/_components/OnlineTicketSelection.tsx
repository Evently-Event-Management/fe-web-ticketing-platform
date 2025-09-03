'use client';

import React, {useMemo, useState, useEffect} from 'react';
import {SessionSeatingMapDTO} from '@/types/event';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Minus, Plus, Ticket} from 'lucide-react';

export const OnlineTicketSelection = ({
                                          seatingMap,
                                          onSelectQuantityAction,
                                          selectedQuantity,
                                      }: {
    seatingMap: SessionSeatingMapDTO;
    onSelectQuantityAction: (quantity: number) => void;
    selectedQuantity: number;
}) => {
    // Internal state to manage the quantity picker
    const [quantity, setQuantity] = useState(selectedQuantity);

    // Memoize ticket info to avoid recalculating on every render
    const onlineInfo = useMemo(() => {
        const block = seatingMap.layout.blocks.find(b => b.type === 'standing_capacity');
        if (!block || !block.seats) return null;

        const tier = block.seats[0]?.tier;
        const availableSeats = block.seats.filter(s => !s.status || s.status === 'AVAILABLE').length;

        return {
            tierName: tier?.name || 'Online Access',
            price: tier?.price || 0,
            availableCount: availableSeats,
        };
    }, [seatingMap]);

    // Sync internal quantity with parent state if it changes
    useEffect(() => {
        setQuantity(selectedQuantity);
    }, [selectedQuantity]);

    if (!onlineInfo) {
        return <Card><CardContent className="p-6">Ticket information is currently unavailable.</CardContent></Card>;
    }

    const handleIncrement = () => {
        if (quantity < onlineInfo.availableCount) {
            setQuantity(q => q + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 0) { // Allow setting to 0 to clear selection
            setQuantity(q => q - 1);
        }
    };

    const handleConfirmSelection = () => {
        onSelectQuantityAction(quantity);
    };

    return (
        <Card className="max-w-lg mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <Ticket className="h-8 w-8 text-primary"/>
                    Online Event Tickets
                </CardTitle>
                <CardDescription>Select the number of tickets you wish to purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/50">
                    <div>
                        <p className="font-semibold text-lg">{onlineInfo.tierName}</p>
                        <p className="font-bold text-xl text-primary">
                            {new Intl.NumberFormat('en-LK', {
                                style: 'currency',
                                currency: 'LKR'
                            }).format(onlineInfo.price)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-green-600">{onlineInfo.availableCount} Available</p>
                        <p className="text-xs text-muted-foreground">tickets left</p>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <p className="font-medium text-muted-foreground">Choose Quantity</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity === 0}>
                            <Minus className="h-4 w-4"/>
                        </Button>
                        <span className="text-3xl font-bold w-20 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={handleIncrement}
                                disabled={quantity >= onlineInfo.availableCount}>
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button size="lg" className="w-full" onClick={handleConfirmSelection}
                        disabled={quantity === selectedQuantity}>
                    {selectedQuantity > 0 && quantity !== selectedQuantity ? `Update Quantity to ${quantity}` : 'Confirm Selection'}
                </Button>
            </CardFooter>
        </Card>
    );
};
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import PaymentForm from '@/components/PaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchOrdersByUserId } from '@/lib/actions/orderActions';
import { Order } from '@/types/order';
import { Loader2 } from 'lucide-react';
import { OrderDebugView } from '@/components/OrderDebugView';

export default function OrderPaymentPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadOrder() {
            try {
                // For now, using a placeholder user ID. In a real app, this would come from auth context
                const currentUserId = "bf5377e7-c064-4f1d-8471-ce1c883b155f"; // Replace with actual user ID from auth
                
                const orders = await fetchOrdersByUserId(currentUserId);
                
                // Find the specific order by ID
                const foundOrder = orders.find(order => order.OrderID === orderId);
                
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    setError('Order not found or does not belong to this user.');
                }
            } catch (err) {
                console.error('Error loading order:', err);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading order details...</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md mx-auto">
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-muted-foreground mb-4">
                        {error || 'Could not find order details. Please check your order ID and try again.'}
                    </p>
                </div>
            </div>
        );
    }

    // Convert the price to cents for Stripe
    const amountInCents = typeof order.Price === 'number' 
        ? Math.round(order.Price * 100)
        : 100; // Default to $1.00 if price is undefined

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                    <CardDescription>
                        Order ID: <span className="font-mono">{orderId}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-8">
                        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                        <div className="flex justify-between py-2 border-b">
                            <span>Total Amount</span>
                            <span className="font-bold">
                                ${typeof order.Price === 'number' 
                                   ? order.Price.toFixed(2) 
                                   : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span>Number of Seats</span>
                            <span>{order.SeatIDs?.length || 0}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span>Status</span>
                            <span className="capitalize">{order.Status?.toLowerCase()}</span>
                        </div>
                        {order.CreatedAt && (
                            <div className="flex justify-between py-2 border-b">
                                <span>Order Date</span>
                                <span>{new Date(order.CreatedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Payment Details</h3>
                        <Elements stripe={stripePromise}>
                            <PaymentForm amount={amountInCents} orderId={orderId} />
                        </Elements>
                    </div>
                    
                    {/* Debug view showing all order data */}
                    <OrderDebugView order={order} orderId={orderId} />
                </CardContent>
            </Card>
        </div>
    );
}

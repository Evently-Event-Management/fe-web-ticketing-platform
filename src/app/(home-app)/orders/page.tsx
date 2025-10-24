'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchOrdersByUserId } from '@/lib/actions/orderActions';
import { ApiOrder } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Calendar, Users, Eye, QrCode } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiQRCodeModal } from '@/components/ApiQRCodeModal';

export default function OrdersPage() {
    const { isAuthenticated, keycloak } = useAuth();
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<ApiOrder['tickets'][0] | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const handleViewQR = (ticket: ApiOrder['tickets'][0]) => {
        setSelectedTicket(ticket);
        setQrModalOpen(true);
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        async function loadOrders() {
            try {
                // Get current user ID from auth context
                const currentUserId = keycloak?.tokenParsed?.sub || "bf5377e7-c064-4f1d-8471-ce1c883b155f";
                
                // Fetch user orders from API
                const userOrders = await fetchOrdersByUserId(currentUserId);
                
                setOrders(userOrders);
            } catch (err) {
                console.error('Error loading orders:', err);
                setError('Failed to load your orders. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, [isAuthenticated, keycloak]);

    if (!isAuthenticated) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="text-center">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
                    <p className="text-muted-foreground mb-6">
                        You need to be logged in to view your orders and tickets.
                    </p>
                    <Button onClick={() => keycloak?.login()}>
                        Log In
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="mb-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'destructive';
            case 'expired':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-primary" />
                    My Orders & Tickets
                </h1>
                <p className="text-muted-foreground">
                    View and manage all your event tickets and orders
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
                    <p className="text-muted-foreground mb-6">
                        You haven&apos;t made any ticket purchases yet. Start exploring events!
                    </p>
                    <Link href="/">
                        <Button>Browse Events</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.OrderID} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Order #{order.OrderID.slice(-8)}
                                            <Badge variant={getStatusVariant(order.Status)}>
                                                {order.Status}
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(order.CreatedAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Receipt className="h-4 w-4" />
                                                Event: {order.EventID.slice(-8)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            ${order.Price.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Total Amount
                                        </div>
                                        {order.DiscountAmount && order.DiscountAmount > 0 && (
                                            <div className="text-xs text-green-600">
                                                Saved ${order.DiscountAmount.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium">Tickets</div>
                                            <div className="text-sm text-muted-foreground">
                                                {order.tickets.length} ticket{order.tickets.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium">Session</div>
                                            <div className="text-sm text-muted-foreground font-mono">
                                                {order.SessionID.slice(-8)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {order.DiscountCode && (
                                    <div className="mb-4 p-2 bg-green-50 rounded-md border border-green-200">
                                        <div className="text-sm text-green-800">
                                            <strong>Discount Applied:</strong> {order.DiscountCode} (-${order.DiscountAmount?.toFixed(2)})
                                        </div>
                                    </div>
                                )}

                                {order.tickets.length > 0 && order.Status.toLowerCase() !== 'cancelled' && (
                                    <div className="mb-4">
                                        <div className="text-sm font-medium mb-2">Tickets:</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {order.tickets.map((ticket) => (
                                                <div key={ticket.ticket_id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                                    <div>
                                                        <div className="font-mono text-sm font-medium">{ticket.seat_label}</div>
                                                        <div className="text-xs text-muted-foreground">{ticket.tier_name}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">${ticket.price_at_purchase.toFixed(2)}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {ticket.checked_in ? 'Used' : 'Valid'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {order.Status.toLowerCase() === 'cancelled' && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200">
                                        <div className="text-sm text-red-800">
                                            <strong>Order Cancelled:</strong> This order has been cancelled. Tickets are no longer valid.
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Receipt className="h-5 w-5" />
                                                    Order Details - #{order.OrderID.slice(-8)}
                                                </DialogTitle>
                                            </DialogHeader>
                                            
                                            <div className="space-y-6">
                                                {/* Order Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Order Information</h3>
                                                        <div className="space-y-1 text-sm">
                                                            <div><strong>Order ID:</strong> {order.OrderID}</div>
                                                            <div><strong>Status:</strong> 
                                                                <Badge variant={getStatusVariant(order.Status)} className={`ml-2`}>
                                                                    {order.Status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Event Information</h3>
                                                        <div className="space-y-1 text-sm">
                                                            <div><strong>Event ID:</strong> {order.EventID}</div>
                                                            <div><strong>Session ID:</strong> {order.SessionID}</div>
                                                            <div><strong>User ID:</strong> {order.UserID}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pricing Information */}
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Subtotal:</span>
                                                            <span>${order.SubTotal.toFixed(2)}</span>
                                                        </div>
                                                        {order.DiscountAmount && order.DiscountAmount > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount ({order.DiscountCode}):</span>
                                                                <span>-${order.DiscountAmount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                            <span>Total:</span>
                                                            <span>${order.Price.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tickets Information */}
                                                {order.Status.toLowerCase() !== 'cancelled' ? (
                                                    <div>
                                                        <h3 className="font-semibold mb-3">Tickets ({order.tickets.length})</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {order.tickets.map((ticket) => (
                                                            <Card key={ticket.ticket_id} className="border-l-4 border-l-primary">
                                                                <CardHeader className="pb-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <h4 className="font-medium">{ticket.seat_label}</h4>
                                                                            <Badge variant="outline">{ticket.tier_name}</Badge>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold">${ticket.price_at_purchase.toFixed(2)}</div>
                                                                            <Badge 
                                                                                variant={ticket.checked_in ? "secondary" : "default"}
                                                                                className={ticket.checked_in ? "text-blue-600" : "text-white"}
                                                                            >
                                                                                {ticket.checked_in ? 'Used' : 'Valid'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent className="pt-0">
                                                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                                        <div>
                                                                            <div><strong>Ticket ID:</strong></div>
                                                                            <div className="font-mono">{ticket.ticket_id.slice(-12)}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div><strong>Seat ID:</strong></div>
                                                                            <div className="font-mono">{ticket.seat_id.slice(-12)}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div><strong>Color:</strong></div>
                                                                            <div className="flex items-center gap-1">
                                                                                <div 
                                                                                    className="w-3 h-3 rounded-full border"
                                                                                    style={{ backgroundColor: ticket.colour.toLowerCase() }}
                                                                                ></div>
                                                                                {ticket.colour}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div><strong>Issued:</strong></div>
                                                                            <div>{new Date(ticket.issued_at).toLocaleDateString()}</div>
                                                                        </div>
                                                                        {ticket.checked_in && (
                                                                            <div className="col-span-2">
                                                                                <div><strong>Checked in:</strong></div>
                                                                                <div>{new Date(ticket.checked_in_time).toLocaleString()}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* QR Code Button - Only show for completed orders */}
                                                                    {order.Status.toLowerCase() === 'completed' && (
                                                                        <div className="mt-3 pt-3 border-t">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleViewQR(ticket)}
                                                                                className="w-full"
                                                                            >
                                                                                <QrCode className="h-4 w-4 mr-2" />
                                                                                View QR Code
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                                ) : (
                                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                                        <h3 className="font-semibold mb-2 text-red-800">Order Cancelled</h3>
                                                        <p className="text-sm text-red-700">
                                                            This order has been cancelled. Tickets are no longer valid and cannot be used for entry.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    {order.Status.toLowerCase() === 'pending' && (
                                        <Link href={`/orders/${order.OrderID}`} className="flex-1">
                                            <Button className="w-full">
                                                Complete Payment
                                            </Button>
                                        </Link>
                                    )}
                                    {order.Status.toLowerCase() === 'completed' && (
                                        <Button variant="secondary" className="flex-1">
                                            Download Tickets
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            <ApiQRCodeModal
                ticket={selectedTicket}
                isOpen={qrModalOpen}
                onClose={() => {
                    setQrModalOpen(false);
                    setSelectedTicket(null);
                }}
            />
        </div>
    );
}
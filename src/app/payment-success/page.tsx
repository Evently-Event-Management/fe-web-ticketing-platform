'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Receipt, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { fetchOrderById } from '@/lib/actions/orderActions';
import { Order, PaymentResponse } from '@/types/order';
import { OrderDebugView } from '@/components/OrderDebugView';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentData = searchParams.get('paymentData');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedPaymentData, setParsedPaymentData] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    // Parse payment data if available
    if (paymentData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(paymentData));
        setParsedPaymentData(parsed);
      } catch (error) {
        console.error('Error parsing payment data:', error);
      }
    }

    // Fetch order details
    if (orderId) {
      fetchOrderById(orderId)
        .then(orderData => {
          setOrder(orderData);
        })
        .catch(error => {
          console.error('Error fetching order details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId, paymentData]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </CardHeader>
        </Card>

        {/* Payment Details */}
        {parsedPaymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">PAYMENT INFORMATION</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Payment ID:</span>
                      <span className="text-sm font-medium">{parsedPaymentData.data.payment_record.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Transaction ID:</span>
                      <span className="text-sm font-medium">{parsedPaymentData.data.payment_record.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={parsedPaymentData.data.payment_record.status === 'success' ? 'default' : 'destructive'}>
                        {parsedPaymentData.data.payment_record.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(parsedPaymentData.data.stripe_result.amount, parsedPaymentData.data.stripe_result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Payment Method:</span>
                      <span className="text-sm font-medium">{parsedPaymentData.data.stripe_result.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">ORDER INFORMATION</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Order ID:</span>
                      <span className="text-sm font-medium">{parsedPaymentData.data.payment_record.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Created:</span>
                      <span className="text-sm font-medium">{formatDate(parsedPaymentData.data.payment_record.created_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(parsedPaymentData.data.payment_record.price, parsedPaymentData.data.stripe_result.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Receipt URL */}
              {parsedPaymentData.data.stripe_result.receipt_url && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">Receipt Available</h4>
                    <p className="text-sm text-muted-foreground">Download your payment receipt</p>
                  </div>
                  <Button 
                    asChild 
                    variant="outline"
                    size="sm"
                  >
                    <a 
                      href={parsedPaymentData.data.stripe_result.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      View Receipt
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading order details...</p>
            </CardContent>
          </Card>
        ) : order ? (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Order ID:</span>
                  <span className="text-sm font-medium">{order.OrderID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount:</span>
                  <span className="text-sm font-medium">
                    ${typeof order.Price === 'number' ? order.Price.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Order Date:</span>
                  <span className="text-sm font-medium">
                    {order.CreatedAt ? new Date(order.CreatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant="outline">{order.Status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">Return to Home</Button>
              </Link>
              
              <Link href="/events" className="flex-1">
                <Button className="w-full">Browse More Events</Button>
              </Link>
              
              {orderId && (
                <Link href={`/orders`} className="flex-1">
                  <Button variant="secondary" className="w-full">My Orders</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug view showing all order data */}
        {order && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderDebugView 
                order={order} 
                orderId={orderId || ''}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, Calendar } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

import { createPaymentIntent, PaymentIntentResponse } from '@/lib/actions/orderActions';
import OrderSummary from '@/components/orders/OrderSummary';
import CheckoutForm from '@/components/orders/CheckoutForm';

// Initialize Stripe with appearance for dark mode compatibility
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Initializing payment...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a few moments.</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string | null }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <span className="bg-destructive/10 p-2 rounded-full mr-3">
                <CreditCard className="h-6 w-6" />
              </span>
              Payment Error
            </CardTitle>
            <CardDescription>
              We encountered an error while setting up your payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error || "Could not initialize payment intent."}</p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="default">
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderPayment() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [paymentData, setPaymentData] = useState<PaymentIntentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await createPaymentIntent(orderId);
        setPaymentData(response);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        console.error('Payment intent error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [orderId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !paymentData?.clientSecret) {
    return <ErrorState error={error} />;
  }

  // Configure Stripe appearance based on current theme
  const stripeOptions = {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: resolvedTheme === 'dark' ? 'night' as const : 'stripe' as const,
      variables: {
        colorPrimary: 'var(--color-primary)',
        colorBackground: 'var(--color-card)',
        colorText: 'var(--color-card-foreground)',
        colorDanger: 'var(--color-destructive)',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: 'var(--radius-md)',
        spacingUnit: '4px',
      },
    },
  };
  
  // Use the seat lock duration from the API response
  const seatLockDuration = paymentData.seatLockDurationMins || 10; // Default to 10 minutes if not provided

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form Section - Takes up 2/3 on desktop */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your card information to complete your purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Payment Form - Key ensures re-render when theme changes */}
                <Elements 
                  key={`stripe-elements-${resolvedTheme}`} 
                  stripe={stripePromise} 
                  options={stripeOptions}
                >
                  <CheckoutForm clientSecret={paymentData.clientSecret} orderId={orderId} />
                </Elements>
              </CardContent>
              <CardFooter className="flex flex-col items-center text-xs text-muted-foreground pt-4">
                <p>All payments are secure and encrypted.</p>
                <p className="mt-1">You will receive a confirmation email once your payment is processed.</p>
              </CardFooter>
            </Card>
          </div>
          
          {/* Order Summary Section - Takes up 1/3 on desktop */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your order before payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Order Summary */}
                {paymentData.order && (
                  <OrderSummary 
                    order={paymentData.order} 
                    seatLockDurationMins={seatLockDuration} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add custom CSS for Stripe elements compatibility with dark mode
// This will be injected into the page's global styles
export const dynamic = 'force-dynamic';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, Check } from 'lucide-react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
}

export default function CheckoutForm({ orderId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Apply specific theme-aware styles for message containers
  const getMessageContainerClass = () => {
    if (isSuccess) {
      return 'bg-success text-success-foreground'
    } else {
      return 'bg-destructive text-destructive-foreground'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An error occurred during payment');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsSuccess(true);
      setMessage('Payment successful!');
      setTimeout(() => {
        router.push(`/payment-success?orderId=${orderId}`);
      }, 1500);
    } else {
      setMessage('Payment processing. Please wait...');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="p-5 rounded-lg border bg-card payment-container">
        <PaymentElement options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          }
        }} />
      </div>
      
      {message && (
        <div className={`p-3 rounded-md text-sm ${getMessageContainerClass()}`}>
          {isSuccess && <Check className="inline-block mr-2 h-4 w-4" />}
          {message}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || isLoading || isSuccess}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Payment Complete
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  );
}
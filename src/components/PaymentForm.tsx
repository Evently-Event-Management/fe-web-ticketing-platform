'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { processPayment } from '@/lib/actions/orderActions';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number; // Amount in cents
  orderId: string;
}

const PaymentForm = ({ amount, orderId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details.');
      return;
    }

    if (!billingDetails.name || !billingDetails.email) {
      setError('Please provide your name and email.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // In a real implementation, we would use Stripe's API directly
      // But for this demo, we'll use our simplified payment endpoint
      const paymentResult = await processPayment(orderId);

      if (paymentResult.status !== 'success') {
        setError(paymentResult.message || 'Payment failed. Please try again.');
      } else {
        setPaymentSuccess(true);
        
        // Redirect to success page with payment data after a short delay
        setTimeout(() => {
          const paymentData = encodeURIComponent(JSON.stringify(paymentResult));
          router.push(`/payment-success?orderId=${orderId}&paymentData=${paymentData}`);
        }, 1500);
      }
    } catch (err) {
      setError('An error occurred while processing your payment. Please try again.');
      console.error(err);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Cardholder Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Doe"
          required
          value={billingDetails.name}
          onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane.doe@example.com"
          required
          value={billingDetails.email}
          onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card">Card Details</Label>
        <div className="border rounded-md p-3">
          <CardElement
            id="card"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
            }}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || processing || paymentSuccess}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : paymentSuccess ? (
          'Payment Successful!'
        ) : (
          `Pay ${(amount / 100).toFixed(2)} USD`
        )}
      </Button>
    </form>
  );
};

export default PaymentForm;

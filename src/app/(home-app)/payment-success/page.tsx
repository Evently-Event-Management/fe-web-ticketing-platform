'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ArrowRight, Ticket as TicketIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';


// Format date
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch (e) {
      console.error(e);
    return dateString;
  }
};

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);
  
  // You could fetch the full order details here if needed
  // For now we just use the orderId from the URL

  useEffect(() => {
    // Auto redirect after countdown
    const timer = setTimeout(() => {
      router.push('/');
    }, countdown * 1000);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router, countdown]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-success/20 p-4 flex items-center justify-center">
            <Check className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your order has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-secondary/50 p-4">
            <div className="flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" />
              Order Details
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-success font-medium">Completed</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-4">
            <div className="flex items-center text-sm font-medium mb-2">
              <TicketIcon className="h-4 w-4 mr-2" />
              E-tickets
            </div>
            <p className="text-sm text-muted-foreground">
              Your e-tickets are now available. You can view and download them from your account.
            </p>
            <Separator className="my-3" />
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={() => router.push('/orders')}
            >
              View All Orders
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/')}
          >
            Return to Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Auto-redirecting in {countdown} seconds...
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
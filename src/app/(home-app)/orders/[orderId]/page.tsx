'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {Loader2} from 'lucide-react';

export default function OrderPaymentRedirect() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Simulate redirect to payment gateway
        const timer = setTimeout(() => {
            // In a real implementation, this would redirect to the actual payment gateway
            // For now, we'll just simulate with a countdown
            window.location.href = `/payment-success?orderId=${orderId}`;
        }, 50000);

        // Countdown effect
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
    }, [orderId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
                </div>
                <h1 className="text-2xl font-bold mb-2">Redirecting to Payment Gateway</h1>
                <p className="text-muted-foreground mb-4">
                    Please wait, you will be redirected to the payment gateway in {countdown} seconds...
                </p>
                <p className="text-sm text-muted-foreground">
                    Order ID: <span className="font-mono">{orderId}</span>
                </p>
            </div>
        </div>
    );
}

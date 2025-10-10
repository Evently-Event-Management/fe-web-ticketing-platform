import { NextRequest, NextResponse } from 'next/server';
import { PaymentRequest, PaymentResponse } from '@/types/order';

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const paymentRequest: PaymentRequest = await request.json();

        // Validate required fields
        if (!paymentRequest.order_id) {
            return NextResponse.json(
                { error: 'order_id is required' },
                { status: 400 }
            );
        }

        // Get the Authorization header from the incoming request
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Forward the request to the backend
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088/api';
        const backendResponse = await fetch(`${backendUrl}/v1/stripe/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(paymentRequest),
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('Backend payment request failed:', errorText);
            return NextResponse.json(
                { error: 'Payment processing failed' },
                { status: backendResponse.status }
            );
        }

        // Parse and return the backend response
        const paymentResponse: PaymentResponse = await backendResponse.json();
        return NextResponse.json(paymentResponse);

    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

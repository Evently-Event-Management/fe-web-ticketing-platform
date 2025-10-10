'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';

// Use a safer approach with explicit type casting
interface OrderDebugViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any; // Using any here is justified for a debugging component
  orderId: string;
}

export const OrderDebugView = ({ order, orderId }: OrderDebugViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!order) {
    return (
      <Card className="mt-6 border-dashed border-gray-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              <span>Order Data</span>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">No Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm">
          <p>No order data available for ID: {orderId}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            <span>Order Data</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            {isExpanded ? 'Hide' : 'Show'} Details
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-auto max-h-96">
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(order, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
      <CardContent className="pt-0 pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Order ID:</span>
            <div className="font-mono text-xs truncate">{String(order.OrderID || orderId)}</div>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <div className={`text-xs ${getStatusColor(order.Status)}`}>
              {order.Status ? String(order.Status) : 'Unknown'}
            </div>
          </div>
          <div>
            <span className="font-medium">User:</span>
            <div className="text-xs truncate">{order.UserID ? String(order.UserID) : 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium">Amount:</span>
            <div className="text-xs">
              {typeof order.Price === 'number' 
                ? `$${order.Price.toFixed(2)}` 
                : 'N/A'}
            </div>
          </div>
          <div>
            <span className="font-medium">Event:</span>
            <div className="text-xs truncate">{order.EventID ? String(order.EventID) : 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium">Session:</span>
            <div className="text-xs truncate">{order.SessionID ? String(order.SessionID) : 'N/A'}</div>
          </div>
          {order.CreatedAt && typeof order.CreatedAt === 'string' && (
            <div>
              <span className="font-medium">Created:</span>
              <div className="text-xs">
                {new Date(order.CreatedAt).toLocaleString()}
              </div>
            </div>
          )}
          {order.SeatIDs && (
            <div className="col-span-2">
              <span className="font-medium">Seats:</span>
              <div className="text-xs">
                {Array.isArray(order.SeatIDs) ? 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  order.SeatIDs.map((seat: any) => String(seat)).join(', ') : 
                  'N/A'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on status
function getStatusColor(status: unknown): string {
  if (!status || typeof status !== 'string') return 'text-gray-500';
  
  switch(status.toLowerCase()) {
    case 'completed': 
      return 'text-white';
    case 'pending':
      return 'text-amber-500';
    case 'cancelled':
      return 'text-red-500';
    case 'expired':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}
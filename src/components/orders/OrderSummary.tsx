'use client';

import { OrderDetailsResponse, TicketResponse } from '@/lib/actions/analyticsActions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertTriangle, Tag, Ticket as TicketIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import CountdownTimer from '@/components/ui/countdown-timer';

interface OrderSummaryProps {
  order: OrderDetailsResponse;
  seatLockDurationMins: number;
}

export default function OrderSummary({ order, seatLockDurationMins }: OrderSummaryProps) {
  const [timerExpired, setTimerExpired] = useState(false);

  const handleTimerExpire = () => {
    setTimerExpired(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-secondary/50 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono text-right max-w-[50%] break-all">{order.OrderID}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formatDate(order.CreatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={order.Status === 'pending' ? 'outline' : order.Status === 'completed' ? 'success' : 'destructive'}>
              {order.Status.charAt(0).toUpperCase() + order.Status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Seat Lock Expiration Notice */}
        {timerExpired && (
          <Alert variant="destructive" className="mt-3 mb-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Your seat reservation has expired. The seats may no longer be available, but you can still try to complete the payment.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Countdown Timer */}
        {seatLockDurationMins > 0 && !timerExpired && (
          <CountdownTimer 
            durationInMinutes={seatLockDurationMins} 
            onExpire={handleTimerExpire}
          />
        )}
      </div>

      <TicketsList tickets={order.tickets} />

      <PriceSummary 
        subtotal={order.SubTotal} 
        discountAmount={order.DiscountAmount} 
        discountCode={order.DiscountCode} 
        total={order.Price} 
      />
    </div>
  );
}

interface TicketsListProps {
  tickets: TicketResponse[];
}

function TicketsList({ tickets }: TicketsListProps) {
  return (
    <div>
      <h3 className="font-medium mb-2 flex items-center">
        <TicketIcon className="h-4 w-4 mr-2" />
        Tickets ({tickets.length})
      </h3>
      
      <div className="space-y-0.5 max-h-[240px] overflow-y-auto rounded-md border">
        {tickets.map((ticket: TicketResponse) => (
          <div key={ticket.ticket_id} className="p-2.5 border-b last:border-b-0 flex justify-between items-center hover:bg-secondary/50 transition-colors">
            <div>
              <div className="font-medium">{ticket.tier_name}</div>
              <div className="text-xs text-muted-foreground">Seat: {ticket.seat_label}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div>{formatCurrency(ticket.price_at_purchase, 'LKT', 'en-LK')}</div>
              <div 
                className="w-3 h-3 rounded-full mt-1" 
                style={{ backgroundColor: ticket.colour || 'var(--color-primary)' }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PriceSummaryProps {
  subtotal: number;
  discountAmount: number;
  discountCode: string;
  total: number;
}

function PriceSummary({ subtotal, discountAmount, discountCode, total }: PriceSummaryProps) {
  return (
    <div className="pt-2 mt-4 bg-secondary/30 p-4 rounded-lg">
      <div className="flex justify-between text-sm pb-2">
        <span className="text-muted-foreground">Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      
      {discountAmount > 0 && (
        <div className="flex justify-between text-sm pb-2">
          <span className="text-muted-foreground flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            Discount ({discountCode}):
          </span>
          <span className="text-success">-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="flex justify-between font-semibold text-lg">
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}